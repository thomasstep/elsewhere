import gql from 'graphql-tag';

const typeDefs = gql`
  input SignUpInput {
    email: String!
    password: String!
  }

  input SignInInput {
    email: String!
    password: String!
  }

  input MarkerInput {
    coordinates: LatLngInput!
    name: String
  }

  input MapUpdateInput {
    mapName: String
    mapId: ID!
    owners: MapUserListInput
    writers: MapUserListInput
    readers: MapUserListInput
  }

  input MarkerUpdateInput {
    mapId: ID!
    markerId: ID!
    markerName: String
  }

  input MapUserListInput {
    push: [String]
    pull: [String]
  }

  input LocationBiasInput {
    point: LatLngInput
    rectangle: RectangleInput
  }

  input RectangleInput {
    northeast: LatLngInput
    southwest: LatLngInput
  }

  input LatLngInput {
    lat: Float!
    lng: Float!
  }

  type User {
    id: ID!
    email: String!
    ownedMaps: [ID]!
    readableMaps: [ID]!
    writableMaps: [ID]!
  }

  type Map {
    mapName: String!
    mapId: ID!
    owners: [String]!
    writers: [String]!
    readers: [String]!
  }

  type MapUpdate {
    mapName: Boolean
    owners: Boolean
    writers: Boolean
    readers: Boolean
  }

  type MarkerUpdate {
    markerName: Boolean
  }

  type SignUpPayload {
    user: User!
  }

  type SignInPayload {
    user: User!
  }

  type LatLng {
    lat: Float!
    lng: Float!
  }

  type Marker {
    markerId: ID!
    coordinates: LatLng!
    name: String
  }

  type Query {
    viewer: User
    getMarkers(mapId: ID!): [Marker]!
    getMap(mapId: ID!): Map!
    getPlace(query: String!, locationBias: LocationBiasInput): [LatLng]!
    nearbySearch(location: LatLngInput!): [Marker]!
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
    createMarkers(mapId: ID!, markers: [MarkerInput]!): Boolean!

    """
    Update markers for a map given by ID.
    """
    updateMarker(updates: MarkerUpdateInput!): MarkerUpdate!

    """
    Delete markers from a map given by ID.
    """
    deleteMarkers(mapId: ID!, markerIds: [ID]!): Boolean!

    """
    Create a map with a given name. Returns map's ID.
    """
    createMap(name: String!): ID!

    """
    Update a map with a given by ID.
    """
    updateMap(updates: MapUpdateInput!): MapUpdate!

    """
    TODO
    Creates a map with all the same markers as the given map referenced by ID.
    """
    duplicateMap(mapId: ID!): ID!

    """
    Delete a map given by ID.
    """
    deleteMap(mapId: ID!): Boolean!
  }
`;

export { typeDefs };
