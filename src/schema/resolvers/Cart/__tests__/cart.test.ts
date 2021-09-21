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

    let args = { input: { cartId: '', cartItemId: '' } }

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

    let args = { input: { cartId: 'doesNotExist', cartItemId: 'undefined' } }

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
      id: 'my-cart-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      isCheckedOut: false,
      customerId: 'my-customer-id',
    }

    mockCtx.prisma.cart.findFirst.mockResolvedValue(cart)
    let args = { input: { cartId: 'my-cart-id', cartItemId: 'doesNotExist' } }

    // test
    const result = await removeFromCart({}, args, context)

    // assert
    expect(result).toMatchSnapshot()
  })
})
