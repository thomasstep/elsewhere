const { AuthenticationError } = require('apollo-server-micro');
const { getMarkersAuth } = require('./auth/getMarkers');
const { getMapAuth } = require('./auth/getMap');
const { createMarkersAuth } = require('./auth/createMarkers');
const { updateMarkerAuth } = require('./auth/updateMarker');
const { deleteMarkersAuth } = require('./auth/deleteMarkers');
const { createMapAuth } = require('./auth/createMap');
const { updateMapAuth } = require('./auth/updateMap');
const { deleteMapAuth } = require('./auth/deleteMap');
const { getPlaceAuth } = require('./auth/getPlace');
const { nearbySearchAuth } = require('./auth/nearbySearch');
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
    case 'viewer':
      break;

    case 'signUp':
      break;

    case 'signIn':
      break;

    case 'signOut':
      break;

    case 'getMarkers':
      getMarkersAuth(args, user);
      break;

    case 'getMap':
      getMapAuth(args, user);
      break;

    case 'getPlace':
      getPlaceAuth(user);
      break;

    case 'nearbySearch':
      nearbySearchAuth(user);
      break;

    case 'createMarkers':
      createMarkersAuth(args, user);
      break;

    case 'updateMarker':
      updateMarkerAuth(args, user);
      break;

    case 'deleteMarkers':
      deleteMarkersAuth(args, user);
      break;

    case 'createMap':
      createMapAuth(args, user);
      break;

    case 'updateMap':
      updateMapAuth(args, user);
      break;

    case 'deleteMap':
      deleteMapAuth(args, user);
      break;

    default:
      throw new AuthenticationError('You are not able to access this endpoint.');
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
