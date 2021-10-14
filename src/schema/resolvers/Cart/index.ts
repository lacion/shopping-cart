import { Cart } from '@prisma/client'
import { Context, formatError, formatPrice } from '../../../utils'
import Mutation from './Mutation'
import Query from './Query'

export default {
  Query,
  Mutation,
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
        const total = cartItems.reduce(
          (acc: number, item) => (acc + item.price) as number,
          0,
        )

        return formatPrice(total)
      } catch (error) {
        formatError('Cart.total', error)
        return error
      }
    },
  },
}
