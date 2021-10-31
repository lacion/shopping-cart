import { rule } from 'graphql-shield'
import { Context, getUserId } from '../../utils'

export default {
  isAuthenticatedUser: rule()(
    (_parent: unknown, _args: unknown, context: Context) => {
      const userId = getUserId(context)
      return Boolean(userId)
    },
  ),
  isUnauthenticatedUser: rule()(
    (_parent: unknown, _args: unknown, context: Context) => {
      const userId = getUserId(context)
      return Boolean(!userId)
    },
  ),
  isCartOwner: rule()(
    async (_parent: unknown, { id }: { id: number }, context: Context) => {
      const userId = getUserId(context)

      const customer = await context.prisma.cart
        .findFirst({
          where: {
            id: Number(id),
          },
        })
        .customer()

      return userId === customer?.id
    },
  ),
}
