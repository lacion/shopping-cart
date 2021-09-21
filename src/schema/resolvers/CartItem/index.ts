import { CartItem } from '@prisma/client'
import { ApolloError } from 'apollo-server'
import { MutationUpdateQuantityArgs } from '../../../generated'
import { Context, formatError, formatPrice } from '../../../utils'

export default {
  Mutation: {
    updateQuantity: async (
      _parent: unknown,
      { input }: MutationUpdateQuantityArgs,
      { prisma }: Context,
    ) => {
      try {
        const { quantity, cartItemId } = input

        // check for valid quantity
        if (quantity < 1) {
          throw new ApolloError('Invalid quantity')
        }

        // no specific item id passed.
        if (!cartItemId) {
          throw new ApolloError('Item not found')
        }

        // check if product is in stock based on quantity
        const hasEnoughProducts = await prisma.product.findFirst({
          where: {
            AND: [
              { cartItems: { some: { id: cartItemId } } },
              { stockLevel: { gte: quantity } },
            ],
          },
        })

        // if not enough products, throw error
        if (!hasEnoughProducts) {
          throw new ApolloError('Product out of stock')
        }

        // calculate item price
        const price = hasEnoughProducts.price * quantity

        // add product to cart
        const newCartItem = prisma.cartItem.update({
          where: { id: cartItemId },
          data: {
            quantity,
            price,
          },
        })

        // update product stock level
        const newStockLevel = prisma.product.update({
          where: { id: hasEnoughProducts.id },
          data: {
            stockLevel: {
              decrement: quantity,
            },
          },
        })

        // wrap operations in transaction to ensure both mutations succeed
        await prisma.$transaction([newCartItem, newStockLevel])

        return newCartItem
      } catch (error) {
        formatError('updateQuantity', error)
        return error
      }
    },
  },
  CartItem: {
    // format price into rands so we don't have to worry about that on the frontend
    price: async (_parent: CartItem, args: unknown, { prisma }: Context) => {
      try {
        // get current cart item
        const cartItem = await prisma.cartItem.findUnique({
          where: { id: _parent.id },
        })

        return formatPrice(cartItem.price)
      } catch (error) {
        formatError('Cart.total', error)
        return error
      }
    },
  },
}
