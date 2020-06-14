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
    getMapName: async (parent, args) => {
      const { mapId } = args;
      let mapName = 'Map not found';
      try {
        const map = await maps.findById(mapId).select('name');
        mapName = map.name;
      } catch (err) {
        log.error('Error finding map name.', {
          mapId,
        });
        log.error(err);
        return 'Map not found';
      }

      log.info('Found name for map.', {
        mapId,
        mapName,
      });
      return mapName;
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
      const promises = [];
      markers.forEach((marker) => {
        // TODO check that the marker doesn't already exist
        promises.push(
          maps.findByIdAndUpdate(
            mapId,
            {
              $push: {
                markers: {
                  ...marker,
                },
              },
            },
          ),
        );
      });

      try {
        await Promise.all(promises);
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
      const { user: { id: userId } } = context;
      let map;
      try {
        map = await maps.create({
          name,
        });
      } catch (err) {
        log.error('Error creating map.', {
          name,
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
  },
};

export { resolvers };
