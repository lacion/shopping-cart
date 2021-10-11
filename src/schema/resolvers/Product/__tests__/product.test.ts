import { Context, createMockContext, MockContext } from '../../../../utils'
import resolvers from '../index'

let mockCtx: MockContext
let context: Context

beforeEach(() => {
  mockCtx = createMockContext()
  context = mockCtx as unknown as Context
})

describe('Product - get products', () => {
  it('returns an error if invalid category id is parsed', async () => {
    // setup
    const {
      Query: { products },
    } = resolvers

    let args = { filterBy: { categoryId: 0 } }

    // test
    const result = await products({}, args, context)

    // assert
    expect(result).toMatchSnapshot()
  })

  it('returns a response of type array', async () => {
    // setup
    const {
      Query: { products },
    } = resolvers

    let args = { filterBy: { skip: 0, take: 10 } }

    const product = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'my product',
      description: 'my product description',
      price: 2300,
      sku: 99888,
      stockLevel: 45,
      expiresAt: new Date(),
      categoryId: 1,
    }

    mockCtx.prisma.product.findMany.mockResolvedValue([product])

    // test
    const result = await products({}, args, context)

    // assert
    expect(Array.isArray(result)).toBe(true)
  })
})
