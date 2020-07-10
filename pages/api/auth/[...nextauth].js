import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import { log } from '../../../utils/log';

const options = {
  site: process.env.SITE || 'http://localhost:3000',

  // Configure one or more authentication providers
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    }),
    // Providers.Email({
    //   server: process.env.EMAIL_SERVER,
    //   from: process.env.EMAIL_FROM,
    // }),
  ],
  database: {
    type: 'mongodb',
    url: process.env.MONGODB_FOR_AUTH,
    entityPrefix: 'nextauth_',
    useNewUrlParser: true,
    // synchronize: true,
  },
  debug: true,
  events: {
    createUser: async (message) => {
      log.info('USER CREATED', {message})
      log.info(JSON.stringify(message))
    },
  },
};

export default (req, res) => NextAuth(req, res, options);
