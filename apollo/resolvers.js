import { AuthenticationError, UserInputError } from 'apollo-server-micro';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const { v4 } = require('uuid');
const { log } = require('../utils/log');


const { maps, users } = require('../utils/db');

const { JWT_SECRET } = process.env;

function createUser(data) {
  const salt = bcrypt.genSaltSync();

  return {
    id: v4(),
    email: data.email,
    hashedPassword: bcrypt.hashSync(data.password, salt),
  };
}

function validPassword(user, password) {
  return bcrypt.compareSync(password, user.hashedPassword);
}

const resolvers = {
  Query: {
    async viewer(parent, args, context) {
      if (!context.user) {
        throw new AuthenticationError('Authentication token is invalid, please log in.');
      }
      return context.user;
    },
    getMarkers: async (parent, args) => {
      const { markers } = await maps.findOne({ map: args.map });
      return markers;
    },
  },
  Mutation: {
    async signUp(parent, args) {
      const newUser = createUser(args.input);

      await users.create(newUser);

      return { user: newUser };
    },

    async signIn(parent, args, context) {
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
    async signOut(parent, args, context) {
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
    upsertMarkers: async (parent, args) => {
      const promises = [];
      args.markers.forEach((marker) => {
        promises.push(
          maps.updateOne(
            {
              map: args.map,
            },
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
      const promises = [];
      args.markers.forEach((marker) => {
        promises.push(
          maps.update(
            {
              map: args.map,
            },
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
  },
};

export { resolvers };
