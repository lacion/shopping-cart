import { ApolloError } from 'apollo-server'
import { QueryCartArgs } from '../../../../generated'
import { Context, formatError } from '../../../../utils'

export default async (
  _parent: unknown,
  { id }: QueryCartArgs,
  { prisma }: Context,
) => {
  try {
    if (!id) {
      throw new ApolloError('Cart ID is required')
    }

    return await prisma.cart.findUnique({
      where: {
        id,
      },
    })
  } catch (error) {
    formatError('cart', error)
    return error
  }
}
