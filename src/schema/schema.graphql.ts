import { gql } from 'apollo-server'

export default gql`
  scalar Date

  input GetProductsInput {
    categoryId: Int
    skip: Int = 0 # default to 1st page
    take: Int = 10 # default to 10 products
    name: String
  }

  input AddToCartInput {
    cartId: Int
    productId: Int!
    quantity: Int! # default to at least 1 product
  }

  input RemoveFromCartInput {
    cartItemId: Int!
    cartId: Int!
  }

  input UpdateQuantityInput {
    cartItemId: Int!
    quantity: Int!
  }

  type Cart {
    id: Int
    createdAt: Date
    updatedAt: Date
    isCheckedOut: Boolean
    cartItems: [CartItem]
    total: String # formatted price
  }

  type CartItem {
    id: Int
    createdAt: Date
    updatedAt: Date
    cart: Cart
    product: Product
    quantity: Int
    price: String # formatted price
  }

  type Category {
    id: Int
    name: String
    products: [Product]
  }

  type Product {
    id: Int
    name: String
    description: String
    price: String
    sku: Int
    stockLevel: Int
    expiresAt: Date
    category: Category
    cartItems: [CartItem]
  }

  type Query {
    cart(id: Int!): Cart
    products(filterBy: GetProductsInput!): [Product]
  }

  type Mutation {
    # Auth
    login(email: String!): String

    addToCart(input: AddToCartInput!): Cart
    removeFromCart(input: RemoveFromCartInput!): Cart
    updateQuantity(input: UpdateQuantityInput!): CartItem
    checkout(cartId: Int!): Cart
  }
`
