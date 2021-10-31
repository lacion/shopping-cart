import { shield } from 'graphql-shield'
import rules from './rules'

const { isAuthenticatedUser, isCartOwner, isUnauthenticatedUser } = rules

export default shield({
  Query: {
    cart: isAuthenticatedUser,
    products: isAuthenticatedUser,
  },
  Mutation: {
    login: isUnauthenticatedUser,

    addToCart: isCartOwner,
    removeFromCart: isCartOwner,
    updateQuantity: isCartOwner,
    checkout: isCartOwner,
  },
})
