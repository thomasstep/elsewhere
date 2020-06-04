import gql from 'graphql-tag';

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    ownedMaps: [ID]!
    readableMaps: [ID]!
    writableMaps: [ID]!
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
    viewer: User
    getMarkers(map: ID!): [Marker]!
  }

  type Mutation {
    """
    Sign up for Elsewhere.
    """
    signUp(input: SignUpInput!): SignUpPayload!

    """
    Sign in to Elsewhere.
    """
    signIn(input: SignInInput!): SignInPayload!

    """
    Sign out from Elsewhere.
    """
    signOut: Boolean!

    """
    Create markers for a map given by ID.
    """
    createMarkers(map: ID!, markers: [MarkerInput]!): Boolean!

    """
    Delete markers from a map given by ID.
    """
    deleteMarkers(map: ID!, markers: [MarkerInput]!): Boolean!

    """
    Create a map with a given name. Returns map's ID.
    """
    createMap(name: String): ID!

    """
    TODO
    Creates a map with all the same markers as the given map referenced by ID.
    """
    duplicateMap(map: ID!): ID!

    """
    TODO
    Delete a map given by ID.
    """
    deleteMap(map: ID!): Boolean!
  }
`;

export { typeDefs };
