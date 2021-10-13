import { ApolloError } from 'apollo-server'
import { MutationCheckoutArgs } from '../../../../generated'
import { Context, formatError } from '../../../../utils'

export default async (
  _parent: unknown,
  { cartId }: MutationCheckoutArgs,
  { prisma }: Context,
) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: { AND: [{ id: cartId }, { isCheckedOut: false }] },
    })

    if (!cart) {
      throw new ApolloError('Cart not found')
    }

    // checkout cart
    const updatedCart = await prisma.cart.update({
      where: { id: cart.id },
      data: {
        isCheckedOut: true,
      },
    })

    return updatedCart
  } catch (error) {
    formatError('checkout', error)
    return error
  }
}
