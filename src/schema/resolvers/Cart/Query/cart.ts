import { ApolloError } from 'apollo-server'
import { QueryCartArgs } from 'src/generated'
import { Context, formatError } from 'src/utils'

export default async (
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
}
