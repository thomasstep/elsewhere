import passport from 'passport';
import Google from 'passport-google-oauth20';
import nextConnect from 'next-connect';
import { log } from '../../../utils';


const authenticate = (method, req, res) => new Promise((resolve, reject) => {
  passport.authenticate(
    method,
    {
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    },
    (error, token) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    },
  )(req, res);
});

const {
  SITE,
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET,
} = process.env;

passport.use(new Google.Strategy(
  {
    clientID: GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: GOOGLE_OAUTH_CLIENT_SECRET,
    callbackURL: `${SITE}/api/google/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    log.info('THIS SHOULD NEVER BE CALLED.', {
      accessToken,
      refreshToken,
      profile,
    });
    done(null, null);
  },
));

export default nextConnect()
  .use(passport.initialize())
  .get(async (req, res) => {
    try {
      await authenticate('google', req, res);
    } catch (error) {
      console.error(error);
    }
  });
