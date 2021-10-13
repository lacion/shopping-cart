import { Context, createMockContext, MockContext } from '../../../../utils'
import resolvers from '../index'

let mockCtx: MockContext
let context: Context

beforeEach(() => {
  mockCtx = createMockContext()
  context = mockCtx as unknown as Context
})

describe('Cart - Remove from Cart', () => {
  it('returns an error if invalid input is parsed', async () => {
    // setup
    const {
      Mutation: { removeFromCart },
    } = resolvers

    const args = { input: { cartId: 0, cartItemId: 0 } }

    // test
    const result = await removeFromCart({}, args, context)

    // assert
    expect(result).toMatchSnapshot()
  })

  it('returns an error if cart id not found', async () => {
    // setup
    const {
      Mutation: { removeFromCart },
    } = resolvers

    const args = { input: { cartId: 7, cartItemId: 7 } }

    // test
    const result = await removeFromCart({}, args, context)

    // assert
    expect(result).toMatchSnapshot()
  })

  it('returns an error if cart item id not found', async () => {
    // setup
    const {
      Mutation: { removeFromCart },
    } = resolvers

    const cart = {
      id: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      isCheckedOut: false,
      customerId: 1,
    }

    mockCtx.prisma.cart.findFirst.mockResolvedValue(cart)
    const args = { input: { cartId: 3, cartItemId: 5 } }

    // test
    const result = await removeFromCart({}, args, context)

    // assert
    expect(result).toMatchSnapshot()
  })
})

describe('Cart - Checkout Cart', () => {
  it('returns an error if cart id not found', async () => {
    // setup
    const {
      Mutation: { checkout },
    } = resolvers

    mockCtx.prisma.cart.findFirst.mockResolvedValue(null)
    const args = { cartId: 1 }

    // test
    const result = await checkout({}, args, context)

    // assert
    expect(result).toMatchSnapshot()
  })
})
