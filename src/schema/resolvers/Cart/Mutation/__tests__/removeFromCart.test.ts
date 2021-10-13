import {
  cartFactory,
  categoryFactory,
  clearData,
  Context,
  customerFactory,
  prisma,
  productFactory,
} from 'src/utils'
import resolvers from '../../index'

let context: Context

beforeAll(async () => {
  await clearData()

  context = {
    prisma,
    userId: 1,
  }

  const categories = categoryFactory.buildList(2)

  // create product categories
  await prisma.category.createMany({
    data: categories,
  })

  const products = productFactory.buildList(2)

  // create products
  await prisma.product.createMany({
    data: products,
  })

  const customers = customerFactory.buildList(2)

  // create the customer
  await prisma.customer.createMany({
    data: customers,
  })
})

afterAll(async () => {
  await clearData()

  await prisma.$disconnect()
})

test('should remove existing item from cart if ids are valid', async () => {
  const {
    Mutation: { addToCart, removeFromCart },
  } = resolvers

  const cartA = cartFactory.build({ id: 50, customerId: 1 })

  // create the cart
  const cart = await prisma.cart.create({
    data: cartA,
  })

  const productId = 2

  const args = { input: { productId, quantity: 3, cartId: cart.id } }

  // The productId supplied doesn't exit so the function should return an "Out of stock" message
  const result = await addToCart({}, args, context)

  // expect cart to have cart item
  const cartItem = await prisma.cartItem.findFirst({
    where: { cartId: result.id },
    orderBy: { createdAt: 'desc' },
  })

  if (cartItem) {
    // expect cart item to have correct quantity
    expect(cartItem).toHaveProperty('quantity', 3)

    // expect product to have correct quantity
    const product = await prisma.product.findFirst({
      where: { id: productId },
    })

    expect(product?.stockLevel).toEqual(17)
    const cartItemArgs = { input: { cartItemId: cartItem.id, cartId: cart.id } }

    // The productId supplied doesn't exit so the function should return an "Out of stock" message
    const result = await removeFromCart({}, cartItemArgs, context)

    if (result) {
      const updatedProduct = await prisma.product.findFirst({
        where: { id: productId },
      })

      const deletedItem = await prisma.cartItem.findFirst({
        where: { id: cartItem.id },
      })

      expect(updatedProduct?.stockLevel).toEqual(20)
      expect(deletedItem).toBeFalsy()
    }
  }
})
