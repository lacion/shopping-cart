import { Cart } from '@prisma/client'
import { ApolloError } from 'apollo-server'
import {
  MutationAddToCartArgs,
  MutationRemoveFromCartArgs,
} from '../../../generated'
import { Context, formatError, formatPrice } from '../../../utils'

export default {
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
        let cart: Cart

        if (cartId) {
          cart = await prisma.cart.findFirst({
            where: {
              AND: [{ id: cartId }, { isCheckedOut: false }],
            },
          })

          if (!cart) {
            // create new cart
            cart = await prisma.cart.create({
              data: {
                customer: { connect: { id: userId } },
              },
            })
          }
        } else {
          // create new cart
          cart = await prisma.cart.create({
            data: {
              customer: { connect: { id: userId } },
            },
          })
        }

        const priceInCents = hasEnoughProducts.price * safeQuantity

        // add product to cart
        const newCartItem = prisma.cartItem.create({
          data: {
            quantity: safeQuantity,
            cart: { connect: { id: cart.id } },
            customer: { connect: { id: userId } },
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
          throw new ApolloError('Product not found')
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

        // delete cart item
        const deletedCartItem = prisma.cartItem.delete({
          where: { id: cartItemId },
        })

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
        await prisma.$transaction([deletedCartItem, newStockLevel, updatedCart])

        return isValidCart
      } catch (error) {
        formatError('removeFromCart', error)
        return error
      }
    },
  },
  Cart: {
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
