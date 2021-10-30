import { Product } from '@prisma/client'
import { Context, formatError, formatPrice } from '../../../utils'
import Query from './Query'

export default {
  Query,
  Product: {
    // calculate price based db so we don't have to worry about outdated data
    price: async (_parent: Product, args: unknown, { prisma }: Context) => {
      try {
        // get current product
        const product = await prisma.product.findUnique({
          where: { id: _parent.id },
        })

        return formatPrice(product ? product.price : 0)
      } catch (error) {
        formatError('Product.price', error)
        return error
      }
    },
  },
}
