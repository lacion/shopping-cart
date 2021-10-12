import { Cart } from '@prisma/client'
import { ApolloError } from 'apollo-server'
import {
  MutationAddToCartArgs,
  MutationCheckoutArgs,
  MutationRemoveFromCartArgs,
  QueryCartArgs,
} from '../../../generated'
import { Context, formatError, formatPrice } from '../../../utils'

export default {
  Query: {
    cart: async (
      _parent: unknown,
      { id }: QueryCartArgs,
      { prisma }: Context,
    ) => {
      try {
        if (!id) {
          throw new ApolloError('Cart ID is required')
        }

        return prisma.cart.findUnique({
          where: {
            id,
          },
        })
      } catch (error) {
        formatError('cart', error)
        return error
      }
    },
  },
  Mutation: {
    addToCart: async (
      _parent: unknown,
      { input }: MutationAddToCartArgs,
      { prisma, userId }: Context,
    ) => {
      try {
        const { productId, quantity, cartId } = input
        let safeQuantity = quantity > 0 ? quantity : 1

        // no specific product id passed.
        if (!productId) {
          throw new ApolloError('Product not found')
        }

        const check = await prisma.product.findFirst({
          where: {
            AND: [{ id: productId }],
          },
        })

        console.log({ check, productId })
        // check if product is in stock based on quantity
        const hasEnoughProducts = await prisma.product.findFirst({
          where: {
            AND: [{ id: productId }, { stockLevel: { gte: safeQuantity } }],
          },
        })

        if (!hasEnoughProducts) {
          throw new ApolloError('Product out of stock')
        }

        // check if user already has unchecked out cart
        let cart: Cart | null

        // if cartId is passed, use that
        if (cartId) {
          console.log('has cartId')
          cart = await prisma.cart.findFirst({
            where: {
              AND: [{ id: cartId }, { isCheckedOut: false }],
            },
          })

          if (!cart) {
            console.log('cart not found/checked out so creating new one')
            // create new cart
            cart = await prisma.cart.create({
              data: {
                customer: { connect: { id: userId } },
              },
            })
          }
        } else {
          // check if user has a cart
          const userCart = await prisma.cart.findFirst({
            where: {
              isCheckedOut: false,
            },
          })

          console.log({ userCart })
          if (userCart) {
            console.log('user has unchecked out cart')
            cart = userCart
          } else {
            console.log('user has no cart so creating new one')
            // create new cart
            cart = await prisma.cart.create({
              data: {
                customer: { connect: { id: userId } },
              },
            })
          }
        }

        console.log({ cart })

        const priceInCents = hasEnoughProducts.price * safeQuantity

        // if this product is already in cart, update cart item quantity & price
        const cartItem = await prisma.cartItem.findFirst({
          where: {
            AND: [{ cart: { id: cart.id } }, { product: { id: productId } }],
          },
        })

        if (cartItem) {
          // add product to cart
          const updatedCartItem = prisma.cartItem.update({
            where: { id: cartItem.id },
            data: {
              quantity: {
                increment: safeQuantity,
              },
              price: {
                increment: priceInCents,
              },
            },
          })

          // update product stock level
          const newStockLevel = prisma.product.update({
            where: { id: productId },
            data: {
              stockLevel: {
                decrement: safeQuantity,
              },
            },
          })

          // wrap operations in transaction to ensure both mutations succeed
          await prisma.$transaction([updatedCartItem, newStockLevel])

          return cart
        }

        if (!cart) {
          throw new ApolloError('Cart not found')
        }

        console.log('create new cart item', cart)
        const reCheck = await prisma.cart.findMany()

        console.log({ reCheck })
        // add product to cart
        const newCartItem = prisma.cartItem.create({
          data: {
            quantity: safeQuantity,
            cart: { connect: { id: cart.id } },
            product: { connect: { id: productId } },
            price: priceInCents,
          },
        })

        // update product stock level
        const newStockLevel = prisma.product.update({
          where: { id: productId },
          data: {
            stockLevel: {
              decrement: safeQuantity,
            },
          },
        })

        // wrap operations in transaction to ensure both mutations succeed
        await prisma.$transaction([newCartItem, newStockLevel])

        return cart
      } catch (error) {
        formatError('addToCart', error)
        return error
      }
    },
    removeFromCart: async (
      _parent: unknown,
      { input }: MutationRemoveFromCartArgs,
      { prisma }: Context,
    ) => {
      try {
        const { cartItemId, cartId } = input

        // no specific item id or cart id passed.
        if (!cartItemId || !cartId) {
          throw new ApolloError('Invalid input')
        }

        // check if cart is valid
        const isValidCart = await prisma.cart.findFirst({
          where: { AND: [{ id: cartId }, { isCheckedOut: false }] },
        })

        if (!isValidCart) {
          throw new ApolloError('Cart not found')
        }

        // check if cart is valid
        const isValidCartItem = await prisma.cartItem.findUnique({
          where: { id: cartItemId },
          include: {
            product: true,
          },
        })

        if (!isValidCartItem) {
          throw new ApolloError('Cart Item not found')
        }

        const quantity = isValidCartItem.quantity

        // update product stock level
        const newStockLevel = prisma.product.update({
          where: { id: isValidCartItem.product.id },
          data: {
            stockLevel: {
              increment: quantity,
            },
          },
        })

        // remove item from cart
        const updatedCart = prisma.cart.update({
          where: { id: cartId },
          data: {
            cartItems: { disconnect: { id: cartItemId } },
          },
        })

        // wrap operations in transaction to ensure both mutations succeed
        const result = await prisma.$transaction([newStockLevel, updatedCart])

        // if both mutations succeed, delete cart item
        if (result.every((item) => item.id)) {
          await prisma.cartItem.delete({
            where: { id: cartItemId },
          })
        }
        return isValidCart
      } catch (error) {
        formatError('removeFromCart', error)
        return error
      }
    },
    checkout: async (
      _parent: unknown,
      { cartId }: MutationCheckoutArgs,
      { prisma }: Context,
    ) => {
      try {
        const cart = await prisma.cart.findFirst({
          where: { AND: [{ id: cartId }, { isCheckedOut: false }] },
        })

        if (!cart) {
          throw new ApolloError('Cart not found')
        }

        // checkout cart
        const updatedCart = await prisma.cart.update({
          where: { id: cart.id },
          data: {
            isCheckedOut: true,
          },
        })

        return updatedCart
      } catch (error) {
        formatError('checkout', error)
        return error
      }
    },
  },
  Cart: {
    // format price into rands so we don't have to worry about that on the frontend
    cartItems: async (_parent: Cart, args: unknown, { prisma }: Context) => {
      try {
        // get  cart items in cart
        const cartItems = await prisma.cart
          .findUnique({
            where: { id: _parent.id },
          })
          .cartItems()

        return cartItems
      } catch (error) {
        formatError('Cart.cartItems', error)
        return error
      }
    },
    // calculate price based db so we don't have to worry about outdated data
    total: async (_parent: Cart, args: unknown, { prisma }: Context) => {
      try {
        // get all cart items
        const cartItems = await prisma.cart
          .findUnique({
            where: { id: _parent.id },
          })
          .cartItems()

        // sum up all cart items prices for total
        const total = cartItems.reduce((acc, item) => acc + item.price, 0)

        return formatPrice(total)
      } catch (error) {
        formatError('Cart.total', error)
        return error
      }
    },
  },
}
