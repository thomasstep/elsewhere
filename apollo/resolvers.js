import { AuthenticationError, UserInputError } from 'apollo-server-micro'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import getConfig from 'next/config'
import bcrypt from 'bcrypt'
const { v4 } = require('uuid');

const { maps, users } = require('../utils/db');

const JWT_SECRET = process.env.JWT_SECRET

function createUser(data) {
  const salt = bcrypt.genSaltSync()

  return {
    id: v4(),
    email: data.email,
    hashedPassword: bcrypt.hashSync(data.password, salt),
  }
}

function validPassword(user, password) {
  return bcrypt.compareSync(password, user.hashedPassword)
}

export const resolvers = {
  Query: {
    async viewer(_parent, _args, context, _info) {
      console.log(context.req.headers.cookie)
      const { token } = cookie.parse(context.req.headers.cookie ?? '')
      if (token) {
        try {
          const { id, email } = jwt.verify(token, JWT_SECRET)
          const user = await users.findOne({ id, email });

          return user;
        } catch {
          throw new AuthenticationError('Authentication token is invalid, please log in.');
        }
      } else {
        throw new AuthenticationError('No token found, please log in.');
      }
    },
    getMarkers: async (parent, args) => {
      const { markers } = await maps.findOne({ map: args.map });
      return markers;
    },
  },
  Mutation: {
    async signUp(_parent, args, _context, _info) {
      const newUser = createUser(args.input)

      await users.create(newUser)

      return { user: newUser }
    },

    async signIn(_parent, args, context, _info) {
      const user = await users.findOne({ email: args.input.email});

      if (user && validPassword(user, args.input.password)) {
        const token = jwt.sign(
          { email: user.email, id: user.id, time: new Date() },
          JWT_SECRET,
          {
            expiresIn: '6h',
          }
        )

        context.res.setHeader(
          'Set-Cookie',
          cookie.serialize('token', token, {
            httpOnly: true,
            maxAge: 6 * 60 * 60,
            path: '/',
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
          })
        )

        return { user }
      }

      throw new UserInputError('Invalid email and password combination')
    },
    async signOut(_parent, _args, context, _info) {
      context.res.setHeader(
        'Set-Cookie',
        cookie.serialize('token', '', {
          httpOnly: true,
          maxAge: -1,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        })
      )

      return true
    },
    upsertMarkers: async (parent, args) => {
      const promises = [];
      args.markers.forEach((marker) => {
        promises.push(
          maps.updateOne(
            {
              map: args.map
            },
            {
              $push: {
                markers: {
                  ...marker
                }
              }
            }
          )
        );
      });

      try {
        await Promise.all(promises);
      } catch (err) {
        console.error('Error upserting markers.');
        console.error(err);
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
        console.error('Error deleting markers.');
        console.error(err);
        return false;
      }

      return true;
    },
  },
}
