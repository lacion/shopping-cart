import { ApolloServer, gql } from 'apollo-server'

const typeDefs = gql`
  type Query {
    test: String
  }
`

const resolvers = {
  Query: {
    test: () => 'Hello',
  },
}

const server = new ApolloServer({ typeDefs, resolvers })

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
