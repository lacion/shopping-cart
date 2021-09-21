import { gql } from 'apollo-server'

export default gql`
  scalar Date

  input GetProductsInput {
    categoryId: String
    skip: Int = 0 # default to 1st page
    take: Int = 10 # default to 10 products
    name: String
  }

  input AddToCartInput {
    cartId: String
    productId: String!
    quantity: Int = 1 # default to at least 1 product
  }

  input UpdateQuantityInput {
    cartItemId: String!
    quantity: Int
  }

  type Cart {
    id: String
    createdAt: Date
    updatedAt: Date
    isCheckedOut: Boolean
    cartItems: [CartItem]
    total: String # formatted price
  }

  type CartItem {
    id: String
    createdAt: Date
    updatedAt: Date
    cart: Cart
    product: Product
    quantity: Int
    price: String # formatted price
  }

  type Category {
    id: String
    name: String
    products: [Product]
  }

  type Product {
    id: String
    name: String
    description: String
    price: Int
    sku: Int
    stockLevel: Int
    expiresAt: Date
    category: Category
    cartItems: [CartItem]
  }

  type Query {
    login(email: String!): String
    products(filterBy: GetProductsInput): [Product]
  }

  type Mutation {
    addToCart(input: AddToCartInput!): Cart
    updateQuantity(input: UpdateQuantityInput!): CartItem
  }
`
