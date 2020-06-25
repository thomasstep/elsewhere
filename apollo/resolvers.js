import { AuthenticationError, UserInputError } from 'apollo-server-micro';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 } from 'uuid';

import { log } from '../utils/log';


const { maps, users } = require('../utils/db');

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
        const map = await maps.findById(mapId);
        markers = map.markers;
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
        map = await maps.findById(mapId);
        map = {
          // eslint-disable-next-line no-underscore-dangle
          mapId: map._id,
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
        return map;
      }

      log.info('Found map.', {
        map,
      });
      return map;
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

    createMarkers: async (parent, args) => {
      const { mapId, markers } = args;

      try {
        await maps.findByIdAndUpdate(
          mapId,
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

    deleteMarkers: async (parent, args) => {
      const { mapId, markers } = args;
      const promises = [];
      // For some reason $pull $in does not work with an array of objects
      markers.forEach((marker) => {
        promises.push(
          maps.findByIdAndUpdate(
            mapId,
            {
              $pull: {
                markers: marker,
              },
            },
          ),
        );
      });

      try {
        await Promise.all(promises);
      } catch (err) {
        log.error('Error deleting markers.');
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
          id: userId,
          email,
        },
      } = context;
      let map;
      try {
        map = await maps.create({
          name,
          owners: [email],
        });
      } catch (err) {
        log.error('Error creating map.', {
          name,
          owners: [email],
        });
        log.error(err);
        return -1;
      }

      const { _id: newMapId } = map;
      log.info('Map created.', {
        map,
      });

      try {
        await users.updateOne(
          { id: userId },
          {
            $push: {
              ownedMaps: newMapId,
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

      return newMapId;
    },

    updateMap: (parent, args) => args.updates,

    deleteMap: async (parent, args, context) => {
      const { mapId } = args;
      const { user: { id: userId } } = context;
      try {
        await maps.findByIdAndDelete(mapId);
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
          { id: userId },
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
        await maps.findByIdAndUpdate(
          mapId,
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
      // TODO check that users exist and have accounts, then push/pull this map on their account
      const promises = [];
      promises.push(
        maps.findByIdAndUpdate(
          mapId,
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
        maps.findByIdAndUpdate(
          mapId,
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
      const promises = [];
      promises.push(
        maps.findByIdAndUpdate(
          mapId,
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
        maps.findByIdAndUpdate(
          mapId,
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

      return true;
    },

    readers: () => true,
  },
};

export { resolvers };
