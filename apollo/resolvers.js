import { AuthenticationError, UserInputError, ApolloError } from 'apollo-server-micro';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 } from 'uuid';
import { Client } from '@googlemaps/google-maps-services-js';
import sgMail from '@sendgrid/mail';

import { log } from '../utils/log';


const { maps, users } = require('../utils/db');

const mapsClient = new Client({});
const RETRIES = 3;
const { JWT_SECRET } = process.env;

function createUser(data) {
  const salt = bcrypt.genSaltSync();

  return {
    id: v4(),
    email: data.email,
    hashedPassword: bcrypt.hashSync(data.password, salt),
    ownedMaps: [],
    writableMaps: [],
    readableMaps: [],
  };
}

function validPassword(user, password) {
  return bcrypt.compareSync(password, user.hashedPassword);
}

const resolvers = {
  Query: {
    viewer: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('Authentication token is invalid, please log in.');
      }
      return context.user;
    },

    getMarkers: async (parent, args) => {
      const { mapId } = args;
      let markers;
      try {
        const map = await maps.findOne({ uuid: mapId });
        markers = map.markers;
        // If you use the spread operator (...) it does not return a normal object;
        // it returns a Mongoose document, just hardcode the fields in
        markers = markers.map((marker) => ({
          markerId: marker.uuid,
          coordinates: marker.coordinates,
          name: marker.name,
          createdBy: marker.createdBy,
          notes: marker.notes,
        }));
      } catch (err) {
        log.error('Error finding map markers.', {
          mapId,
        });
        log.error(err);
        return [];
      }

      return markers;
    },

    getMap: async (parent, args) => {
      const { mapId } = args;
      let map = {
        mapName: 'Map not found.',
        mapId: -1,
      };

      try {
        map = await maps.findOne({ uuid: mapId });
        map = {
          // eslint-disable-next-line no-underscore-dangle
          mapId: map.uuid,
          mapName: map.name,
          owners: map.owners || [],
          writers: map.writers || [],
          readers: map.readers || [],
        };
      } catch (err) {
        log.error('Error finding map.', {
          mapId,
        });
        log.error(err);
        throw new ApolloError('Error finding map.');
      }

      log.info('Found map.', {
        map,
      });
      return map;
    },

    getPlace: async (parent, args) => {
      const {
        query,
        locationBias = {},
      } = args;
      const {
        point = null,
        rectangle = null,
      } = locationBias;

      const placeSearchParameters = {
        key: process.env.GOOGLE_PLACES_KEY,
        input: query,
        inputtype: 'textquery',
        fields: 'geometry',
      };

      if (point) {
        const {
          lat,
          lng,
        } = point;
        placeSearchParameters.locationbias = `point:${lat},${lng}`;
      }

      // TODO test rectangle
      if (rectangle) {
        const {
          northeast: {
            lat: nelat,
            lng: nelng,
          },
          southwest: {
            lat: swlat,
            lng: swlng,
          },
        } = rectangle;
        placeSearchParameters.locationbias = `rectangle:${swlat.toString()},${swlng.toString()}|${nelat.toString()},${nelng.toString()}`;
      }

      let res;
      try {
        res = await mapsClient.findPlaceFromText({
          params: placeSearchParameters,
        });
      } catch (err) {
        log.error(err);
        log.error(err.response.data.error_message);
      }
      const places = [];
      places.push(res.data.candidates[0].geometry.location);

      return places;
    },

    nearbySearch: async (parent, args) => {
      const {
        location,
      } = args;
      const {
        lat,
        lng,
      } = location;

      const placeSearchParameters = {
        key: process.env.GOOGLE_PLACES_KEY,
        location: `${lat},${lng}`,
        rankby: 'distance',
      };

      let res;
      try {
        res = await mapsClient.placesNearby({
          params: placeSearchParameters,
        });
      } catch (err) {
        log.error(err);
        log.error(err.response.data.error_message);
        return [];
      }
      // log.info('Found places.', res.data.results)
      const places = [];
      places.push({
        name: res.data.results[0].name,
        coordinates: res.data.results[0].geometry.location,
      });

      return places;
    },
  },

  Mutation: {
    signUp: async (parent, args) => {
      const newUser = createUser(args.input);

      await users.create(newUser);
      const result = { user: newUser };
      log.info('User created.');
      log.info(JSON.stringify(result, null, 2));

      return result;
    },

    signIn: async (parent, args, context) => {
      const user = await users.findOne({ email: args.input.email });

      if (user && validPassword(user, args.input.password)) {
        const token = jwt.sign(
          { email: user.email, id: user.id, time: new Date() },
          JWT_SECRET,
          {
            expiresIn: '6h',
          },
        );

        context.res.setHeader(
          'Set-Cookie',
          cookie.serialize('token', token, {
            httpOnly: true,
            maxAge: 6 * 60 * 60,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
          }),
        );

        return { user };
      }

      throw new UserInputError('Invalid email and password combination');
    },

    signOut: async (parent, args, context) => {
      context.res.setHeader(
        'Set-Cookie',
        cookie.serialize('token', '', {
          httpOnly: true,
          maxAge: -1,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        }),
      );

      return true;
    },

    createMarkers: async (parent, args, context) => {
      const { mapId } = args;
      let { markers } = args;
      const {
        user:
        {
          email,
        },
      } = context;

      markers = markers.map((marker) => ({
        ...marker,
        uuid: v4(),
        createdBy: email,
      }));
      try {
        await maps.findOneAndUpdate(
          { uuid: mapId },
          {
            $push: {
              markers: {
                $each: markers,
              },
            },
          },
        );
      } catch (err) {
        log.error('Error upserting markers.');
        log.error(err);
        return false;
      }

      return true;
    },

    createMarker: async (parent, args, context) => {
      const { mapId, marker } = args;
      const {
        user:
        {
          email,
        },
      } = context;

      marker.uuid = v4();
      marker.createdBy = email;
      try {
        await maps.findOneAndUpdate(
          { uuid: mapId },
          {
            $push: {
              markers: {
                ...marker,
              },
            },
          },
        );
      } catch (err) {
        log.error('Error creating marker.');
        log.error(err);
        return null;
      }

      marker.markerId = marker.uuid;
      return marker;
    },

    updateMarker: (parent, args) => args.updates,

    deleteMarkers: async (parent, args) => {
      const { mapId, markerIds } = args;
      try {
        await maps.findOneAndUpdate(
          { uuid: mapId },
          {
            $pull: {
              markers: {
                uuid: {
                  $in: markerIds,
                },
              },
            },
          },
        );
      } catch (err) {
        log.error('Error deleting markers.', {
          mapId,
          markerIds,
        });
        log.error(err);
        return false;
      }

      return true;
    },

    createMap: async (parent, args, context) => {
      const { name } = args;
      const {
        user:
        {
          uuid: userId,
          email,
        },
      } = context;

      let uuid = v4();
      let existingMap;
      for (let i = 0; i < RETRIES; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        existingMap = await maps.findOne({ uuid });
        if (!existingMap) {
          break;
        } else {
          uuid = v4();
        }

        if (i === (RETRIES - 1)) {
          throw new ApolloError('Too many uuid collisions', 'MAX_UUID_COLLISIONS');
        }
      }

      let map;
      try {
        map = await maps.create({
          uuid,
          name,
          owners: [email],
        });
      } catch (err) {
        log.error('Error creating map.', {
          uuid,
          name,
          owners: [email],
        });
        log.error(err);
        return -1;
      }

      log.info('Map created.', {
        map,
      });

      try {
        await users.updateOne(
          { uuid: userId },
          {
            $push: {
              ownedMaps: uuid,
            },
          },
        );
      } catch (err) {
        log.error('Error adding map to user\'s ownedMaps.', {
          map,
        });
        log.error(err);
        return -1;
      }

      return {
        mapId: map.uuid,
        mapName: map.name,
        owners: map.owners,
        writers: map.writers,
        readers: map.readers,
      };
    },

    updateMap: (parent, args) => args.updates,

    deleteMap: async (parent, args, context) => {
      const { mapId } = args;
      const { user: { uuid: userId } } = context;
      try {
        await maps.findOneAndDelete({ uuid: mapId });
      } catch (err) {
        log.error('Error deleting map.', {
          mapId,
        });
        log.error(err);
        return false;
      }

      log.info('Map deleted.', {
        mapId,
      });

      try {
        await users.updateOne(
          { uuid: userId },
          {
            $pull: {
              ownedMaps: mapId,
            },
          },
        );
      } catch (err) {
        log.error('Error removing map to user\'s ownedMaps.', {
          mapId,
        });
        log.error(err);
        return false;
      }

      return true;
    },
  },

  MapUpdate: {
    mapName: async (parent) => {
      const { mapId, mapName } = parent;

      try {
        await maps.findOneAndUpdate(
          { uuid: mapId },
          {
            $set: {
              name: mapName,
            },
          },
        );
      } catch (err) {
        log.error('Error updating map name.', {
          mapId,
          mapName,
        });
        log.error(err);
        return false;
      }

      return true;
    },

    owners: async (parent) => {
      const { mapId, owners = {} } = parent;
      const { push = [], pull = [] } = owners;
      /**
       * TODO check that users exist and have accounts, then push/pull this map on their account
       * This functionality is currently not supported in the UI.
       */
      const promises = [];
      promises.push(
        maps.findOneAndUpdate(
          { uuid: mapId },
          {
            $addToSet: {
              owners: {
                $each: push,
              },
            },
          },
        ),
      );
      promises.push(
        maps.findOneAndUpdate(
          { uuid: mapId },
          {
            $pull: {
              owners: {
                $in: pull,
              },
            },
          },
        ),
      );

      try {
        await Promise.all(promises);
      } catch (err) {
        log.error('Error updating owners.', {
          mapId,
          owners,
        });
        log.error(err);
        return false;
      }

      return true;
    },

    writers: async (parent) => {
      const { mapId, writers = {} } = parent;
      const { push = [], pull = [] } = writers;
      const pushUserPromises = [];
      const pullUserPromises = [];
      /**
       * Find users by email before adding them to a map.
       * Allow non-users to be removed though in case the account was deleted
       * after being added.
       */
      push.forEach((email) => {
        pushUserPromises.push(users.findOneAndUpdate(
          { email },
          {
            $addToSet: {
              writableMaps: mapId,
            },
          },
        ));
      });
      pull.forEach((email) => {
        pullUserPromises.push(users.findOneAndUpdate(
          { email },
          {
            $pull: {
              writableMaps: mapId,
            },
          },
        ));
      });

      const userUpdates = await Promise.all(pushUserPromises);
      let index = 0;
      userUpdates.forEach((update) => {
        if (!update) {
          log.error('Could not find user to update writableMaps.', {
            email: push[index],
            mapId,
          });
          push.splice(index, 1);
        }

        index += 1;
      });

      // Don't care about user validity for pulls
      await Promise.all(pullUserPromises);

      const promises = [];
      promises.push(
        maps.findOneAndUpdate(
          { uuid: mapId },
          {
            $addToSet: {
              writers: {
                $each: push,
              },
            },
          },
        ),
      );
      promises.push(
        maps.findOneAndUpdate(
          { uuid: mapId },
          {
            $pull: {
              writers: {
                $in: pull,
              },
            },
          },
        ),
      );

      try {
        await Promise.all(promises);
      } catch (err) {
        log.error('Error updating writers.', {
          mapId,
          writers,
        });
        log.error(err);
        return false;
      }

      // SendGrid
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const emailPromises = [];
      push.forEach((email) => {
        const msg = {
          to: email,
          from: process.env.EMAIL_FROM,
          subject: 'You have been added to a map',
          text: 'You have been added to a map in Elsewhere.',
          // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
        };
        emailPromises.push(
          sgMail.send(msg),
        );
      });

      try {
        await Promise.all(emailPromises);
      } catch (err) {
        log.error('There was an error with SendGrid while sending email.');
        console.error(err);
      }

      return true;
    },

    readers: () => true,
  },

  MarkerUpdate: {
    markerName: async (parent) => {
      const { mapId, markerId, markerName } = parent;
      try {
        await maps.findOneAndUpdate(
          {
            $and: [
              { uuid: mapId },
              { 'markers.uuid': markerId },
            ],
          },
          {
            $set: {
              'markers.$[elem].name': markerName,
            },
          },
          {
            arrayFilters: [{ 'elem.uuid': markerId }],
          },
        );
      } catch (err) {
        log.error('Error updating marker name.', {
          ...parent,
        });
        log.error(err);
        return false;
      }

      return true;
    },

    notes: async (parent) => {
      const { mapId, markerId, notes } = parent;
      try {
        await maps.findOneAndUpdate(
          {
            $and: [
              { uuid: mapId },
              { 'markers.uuid': markerId },
            ],
          },
          {
            $set: {
              'markers.$[elem].notes': notes,
            },
          },
          {
            arrayFilters: [{ 'elem.uuid': markerId }],
          },
        );
      } catch (err) {
        log.error('Error updating marker notes.', {
          ...parent,
        });
        log.error(err);
        return false;
      }

      return true;
    },
  },
};

export { resolvers };
