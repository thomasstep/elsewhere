function getErrorMessage(error) {
  if (error.graphQLErrors) {
    const { message: errMsg } = error.graphQLErrors.find((graphQLError) => {
      if (
        graphQLError.extensions
        && graphQLError.extensions.code === 'BAD_USER_INPUT'
      ) {
        return true;
      }
      return false;
    });
    return errMsg;
  }
  return error.message;
}

export { getErrorMessage };
