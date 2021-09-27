import { Prisma, Product } from '@prisma/client'
import { ApolloError } from 'apollo-server'
import { QueryProductsArgs } from '../../../generated'
import { Context, formatError, formatPrice } from '../../../utils'

export default {
  Query: {
    products: async (
      _parent: unknown,
      { filterBy }: QueryProductsArgs,
      { prisma }: Context,
    ) => {
      try {
        const { categoryId, name, skip, take } = filterBy
        const formattedSkip = skip ? skip : 0
        const formattedTake = take ? take : 10

        let and: Prisma.Enumerable<Prisma.ProductWhereInput> = []

        // no specific filter passed.
        if (!categoryId && !name) {
          return prisma.product.findMany({
            skip: formattedSkip,
            take: formattedTake,
          })
        }

        // filter by category
        if (categoryId) {
          // check if categoryId is valid
          const category = await prisma.category.findUnique({
            where: { id: categoryId },
          })

          if (!category) {
            throw new ApolloError('Category not found')
          }

          and.push({ category: { id: categoryId } })
        }

        // search by product name
        if (name) {
          and.push({ name: { contains: name } })
        }

        return prisma.product.findMany({
          skip: formattedSkip,
          take: formattedTake,
          where: {
            AND: and,
          },
        })
      } catch (error) {
        formatError('products', error)
        return error
      }
    },
  },
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
