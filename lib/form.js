export default function getErrorMessage(error) {
  if (error.graphQLErrors) {
    // TODO figure out what error.graphQLErrors is and try to use an array loop instead
    for (const graphQLError of error.graphQLErrors) {
      if (
        graphQLError.extensions
        && graphQLError.extensions.code === 'BAD_USER_INPUT'
      ) {
        return graphQLError.message;
      }
    }
  }
  return error.message;
}
