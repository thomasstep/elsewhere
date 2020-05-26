const { getMarkersAuth } = require('./auth/getMarkers');
const { upsertMarkersAuth } = require('./auth/upsertMarkers');
const { deleteMarkersAuth } = require('./auth/deleteMarkers');
// const { log } = require('../utils');

function handleValue(argValue, requestVariables) {
  const {
    kind,
  } = argValue;
  let val;

  switch (kind) {
    case 'IntValue':
      val = argValue.value;
      break;

    case 'Variable':
      val = requestVariables[argValue.name.value];
      break;

    default:
      // If I haven't come across it yet, hopefully it just works...
      val = argValue.value;
      break;
  }

  return val;
}

function flattenArgs(apolloArgs, requestVariables) {
  const args = {};

  apolloArgs.forEach((apolloArg) => {
    // log.info(JSON.stringify(apolloArg, null, 2));
    const {
      kind,
      name: {
        value: argName,
      },
      value: argValue,
    } = apolloArg;

    switch (kind) {
      case 'Argument':
        args[argName] = handleValue(argValue, requestVariables);
        break;

      default:
        break;
    }
  });

  return args;
}

function endpointAuth(endpoint, args, user) {
  switch (endpoint) {
    case 'getMarkers':
      getMarkersAuth(args, user);
      break;

    case 'upsertMarkers':
      upsertMarkersAuth(args, user);
      break;

    case 'deleteMarkers':
      deleteMarkersAuth(args, user);
      break;

    default:
      break;
  }
}

function endpointAuthPlugin() {
  return {
    requestDidStart(requestContext) {
      const {
        context: apolloContext,
        request: {
          variables: requestVariables,
        },
      } = requestContext;

      return {
        didResolveOperation(resolutionContext) {
          const { user } = apolloContext;

          resolutionContext.operation.selectionSet.selections.forEach((selection) => {
            const { value: operationName } = selection.name;
            const args = flattenArgs(selection.arguments, requestVariables);
            endpointAuth(operationName, args, user);
          });
        },
      };
    },
  };
}

module.exports = {
  endpointAuthPlugin,
};
