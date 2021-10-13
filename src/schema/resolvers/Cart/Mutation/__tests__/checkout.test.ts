import {
  cartFactory,
  categoryFactory,
  clearData,
  Context,
  customerFactory,
  prisma,
  productFactory,
} from '../../../../../utils'
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

describe('Checkout Cart', () => {
  it('should checkout if cartId valid and set isCheckedOut to true', async () => {
    const {
      Mutation: { checkout },
    } = resolvers

    const cartA = cartFactory.build({ id: 1, customerId: 1 })

    // create the cart
    await prisma.cart.create({
      data: cartA,
    })

    const args = { cartId: 1 }

    const result = await checkout({}, args, context)

    // expect cart object to be returned
    expect(result.id).toEqual(1)
    expect(result.isCheckedOut).toBeTruthy()
  })
})
