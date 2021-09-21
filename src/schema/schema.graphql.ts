import { gql } from 'apollo-server'

export default gql`
  scalar Date

  type Query {
    login(email: String!): String
  }
`
