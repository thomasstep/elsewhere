import gql from 'graphql-tag'

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
  }

  input SignUpInput {
    email: String!
    password: String!
  }

  input SignInInput {
    email: String!
    password: String!
  }

  type SignUpPayload {
    user: User!
  }

  type SignInPayload {
    user: User!
  }

  type Marker {
    lat: Float!
    lng: Float!
  }

  input MarkerInput {
    lat: Float!
    lng: Float!
  }

  type Query {
    user(id: ID!): User!
    users: [User]!
    viewer: User
    getMarkers(map: ID!): [Marker]!
  }

  type Mutation {
    signUp(input: SignUpInput!): SignUpPayload!
    signIn(input: SignInInput!): SignInPayload!
    signOut: Boolean!
    upsertMarkers(map: ID!, markers: [MarkerInput]!): Boolean!
    deleteMarkers(map: ID!, markers: [MarkerInput]!): Boolean!
  }
`
