import {
  cartFactory,
  categoryFactory,
  clearData,
  Context,
  customerFactory,
  prisma,
  productFactory,
} from '../../../../utils'
import resolvers from '../index'

let context: Context

beforeAll(async () => {
  context = {
    prisma,
    userId: 1,
  }

  await clearData()

  const categoryA = categoryFactory.build({ id: 1 })
  const categoryB = categoryFactory.build({ id: 2 })

  // create product categories
  await prisma.category.createMany({
    data: [categoryA, categoryB],
  })

  //const products = productFactory.buildList(2)
  const productA = productFactory.build({ id: 1 })
  const productB = productFactory.build({ id: 2 })

  // create products
  await prisma.product.createMany({
    data: [productA, productB],
  })

  const customerA = customerFactory.build({ id: 1 })
  const customerB = customerFactory.build({ id: 2 })

  // create the customer
  await prisma.customer.createMany({
    data: [customerA, customerB],
  })
})

afterAll(async () => {
  await clearData()

  await prisma.$disconnect()
})

it('should add to existing cart if cartId valid and add product to cart', async () => {
  const {
    Mutation: { addToCart },
  } = resolvers

  const cartA = cartFactory.build({ id: 1, customerId: 1 })

  // create the cart
  await prisma.cart.create({
    data: cartA,
  })

  const productId = 2

  const args = { input: { productId, quantity: 3, cartId: 1 } }

  // The productId supplied doesn't exit so the function should return an "Out of stock" message
  const result = await addToCart({}, args, context)

  // expect cart object to be returned
  expect(result.customerId).toEqual(1)
  expect(result.isCheckedOut).toBeFalsy()

  const product = await prisma.product.findFirst({ where: { id: productId } })

  if (product && result) {
    // stock level to decrease by 3
    expect(product.stockLevel).toEqual(17)

    // expect cart to have cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: { cartId: result.id },
    })

    // expect cart item total to be product price * 3
    expect(cartItem).toHaveProperty('price', product.price * 3)

    // expect cart item to be linked to product
    expect(cartItem).toHaveProperty('productId', productId)

    // expect cart item to have correct quantity
    expect(cartItem).toHaveProperty('quantity', 3)
  }
})

it('should create cart if no exisiting cartId found and add product to cart', async () => {
  const {
    Mutation: { addToCart },
  } = resolvers

  const args = { input: { productId: 1, quantity: 3, cartId: 99 } }

  // The productId supplied doesn't exit so the function should return an "Out of stock" message
  const result = await addToCart({}, args, context)

  // expect cart object to be returned
  expect(result.customerId).toEqual(1)
  expect(result.isCheckedOut).toBeFalsy()

  const product = await prisma.product.findFirst({ where: { id: 1 } })

  if (product && result) {
    // stock level to decrease by 3
    expect(product.stockLevel).toEqual(17)

    // expect cart to have cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: { cartId: result.id },
    })

    // expect cart item total to be product price * 3
    expect(cartItem).toHaveProperty('price', product.price * 3)

    // expect cart item to be linked to product
    expect(cartItem).toHaveProperty('productId', 1)

    // expect cart item to have correct quantity
    expect(cartItem).toHaveProperty('quantity', 3)
  }
})