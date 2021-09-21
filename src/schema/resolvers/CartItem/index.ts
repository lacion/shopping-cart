import { CartItem } from '@prisma/client'
import { Context, formatError, formatPrice } from '../../../utils'

export default {
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
