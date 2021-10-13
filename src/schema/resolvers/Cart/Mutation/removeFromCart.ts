import { ApolloError } from 'apollo-server'
import { MutationRemoveFromCartArgs } from '../../../../generated'
import { Context, formatError } from '../../../../utils'

export default async (
  _parent: unknown,
  { input }: MutationRemoveFromCartArgs,
  { prisma }: Context,
) => {
  try {
    const { cartItemId, cartId } = input

    // no specific item id or cart id passed.
    if (!cartItemId || !cartId) {
      throw new ApolloError('Invalid input')
    }

    // check if cart is valid
    const isValidCart = await prisma.cart.findFirst({
      where: { AND: [{ id: cartId }, { isCheckedOut: false }] },
    })

    if (!isValidCart) {
      throw new ApolloError('Cart not found')
    }

    // check if cart is valid
    const isValidCartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        product: true,
      },
    })

    if (!isValidCartItem) {
      throw new ApolloError('Cart Item not found')
    }

    const quantity = isValidCartItem.quantity

    // update product stock level
    const newStockLevel = prisma.product.update({
      where: { id: isValidCartItem.product.id },
      data: {
        stockLevel: {
          increment: quantity,
        },
      },
    })

    // remove item from cart
    const updatedCart = prisma.cart.update({
      where: { id: cartId },
      data: {
        cartItems: { disconnect: { id: cartItemId } },
      },
    })

    // wrap operations in transaction to ensure both mutations succeed
    const result = await prisma.$transaction([newStockLevel, updatedCart])

    // if both mutations succeed, delete cart item
    if (result.every((item) => item.id)) {
      await prisma.cartItem.delete({
        where: { id: cartItemId },
      })
    }
    return isValidCart
  } catch (error) {
    formatError('removeFromCart', error)
    return error
  }
}
