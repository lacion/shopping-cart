import { CartItem } from '@prisma/client'
import { Context, formatError, formatPrice } from '../../../utils'
import Mutation from './Mutation'

export default {
  Mutation,
  CartItem: {
    // product linked to CartItem
    product: async (_parent: CartItem, args: unknown, { prisma }: Context) => {
      try {
        // get product related to cart item
        const product = await prisma.cartItem
          .findUnique({
            where: { id: _parent.id },
          })
          .product()

        return product
      } catch (error) {
        formatError('CartItem.product', error)
        return error
      }
    },
    // format price into rands so we don't have to worry about that on the frontend
    price: async (_parent: CartItem, args: unknown, { prisma }: Context) => {
      try {
        // get current cart item
        const cartItem = await prisma.cartItem.findUnique({
          where: { id: _parent.id },
        })

        return formatPrice(cartItem ? cartItem.price : 0)
      } catch (error) {
        formatError('CartItem.price', error)
        return error
      }
    },
  },
}
