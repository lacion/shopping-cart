import { Context, createMockContext, MockContext } from '../../../../utils'
import resolvers from '../index'

let mockCtx: MockContext
let context: Context

beforeEach(() => {
  mockCtx = createMockContext()
  context = mockCtx as unknown as Context
})

describe('CartItem - update quantity', () => {
  it('returns an error if invalid quantity is parsed', async () => {
    // setup
    const {
      Mutation: { updateQuantity },
    } = resolvers

    let args = { input: { quantity: 0, cartItemId: '' } }

    // test
    const result = await updateQuantity({}, args, context)

    // assert
    expect(result).toMatchSnapshot()
  })

  it('returns an error if cart item id is not provided', async () => {
    // setup
    const {
      Mutation: { updateQuantity },
    } = resolvers

    let args = { input: { quantity: 3, cartItemId: 'undefined' } }

    // test
    const result = await updateQuantity({}, args, context)

    // assert
    expect(result).toMatchSnapshot()
  })

  it('returns an error if product is out of stock', async () => {
    // setup
    const {
      Mutation: { updateQuantity },
    } = resolvers

    mockCtx.prisma.product.findFirst.mockResolvedValue(null)

    let args = { input: { quantity: 30, cartItemId: 'my-cart-item-id' } }

    // test
    const result = await updateQuantity({}, args, context)

    // assert
    expect(result).toMatchSnapshot()
  })
})
