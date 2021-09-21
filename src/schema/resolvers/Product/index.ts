import { Prisma, ProductWhereInput } from '@prisma/client'
import { ApolloError } from 'apollo-server'
import { QueryProductsArgs } from '../../../generated'
import { Context, formatError } from '../../../utils'

export default {
  Query: {
    products: async (
      _parent: unknown,
      { filterBy }: QueryProductsArgs,
      { prisma }: Context,
    ) => {
      try {
        const { categoryId, name, skip, take } = filterBy
        let and: Prisma.Enumerable<ProductWhereInput> = []

        // no specific filter passed.
        if (!categoryId && !name) {
          return prisma.product.findMany({ skip, take })
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
          skip,
          take,
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
}
