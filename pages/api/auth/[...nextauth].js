import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import { v4 } from 'uuid';
import { users } from '../../../utils/db';
import { log } from '../../../utils/log';

const providers = [
  Providers.Google({
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  }),
];

if (process.env.NODE_ENV === 'development') {
  providers.push(
    Providers.Email({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  );
}

const options = {
  site: process.env.SITE || 'http://localhost:3000',

  // Configure one or more authentication providers
  providers,
  database: {
    type: 'mongodb',
    url: process.env.MONGODB_FOR_AUTH,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    entityPrefix: 'nextauth_',
    // synchronize: true,
  },
  debug: true,
  events: {
    createUser: async (message) => {
      const { id: userId, email } = message;
      const uuid = v4();

      try {
        await users.create(
          {
            uuid,
            email,
            ownedMaps: [],
            writableMaps: [],
            readableMaps: [],
          },
        );
      } catch (err) {
        log.error('Error creating new user.', {
          nextauthId: userId,
          uuid,
          email,
        });
        log.error(err);
      }
    },
  },
};

export default (req, res) => NextAuth(req, res, options);
