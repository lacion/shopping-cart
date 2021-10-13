import { Cart } from '@prisma/client'
import { ApolloError } from 'apollo-server'
import { MutationAddToCartArgs } from '../../../../generated'
import { Context, formatError } from '../../../../utils'

export default async (
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
    let cart: Cart | null

    // if cartId is passed, use that
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
      // check if user has a cart
      const userCart = await prisma.cart.findFirst({
        where: {
          isCheckedOut: false,
        },
      })

      if (userCart) {
        cart = userCart
      } else {
        // create new cart
        cart = await prisma.cart.create({
          data: {
            customer: { connect: { id: userId } },
          },
        })
      }
    }

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
}
