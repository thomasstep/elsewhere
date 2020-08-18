import passport from 'passport';
import Google from 'passport-google-oauth20';
import nextConnect from 'next-connect';
import { v4 } from 'uuid';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { connectMongo, users } from '../../../utils/db';
import { log } from '../../../utils';

const authenticate = (method, req, res) => new Promise((resolve, reject) => {
  passport.authenticate(
    method,
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
  JWT_SECRET,
} = process.env;

passport.use(new Google.Strategy(
  {
    clientID: GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: GOOGLE_OAUTH_CLIENT_SECRET,
    callbackURL: `${SITE}/api/google/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    const verifiedEmailObject = profile.emails.find((email) => email.verified) || profile.emails[0];
    const { value: verifiedEmail } = verifiedEmailObject;

    let user = await users.findOne({ email: verifiedEmail });

    // Create user if they do not exist
    if (!user) {
      const newUser = {
        uuid: v4(),
        email: verifiedEmail,
        googleId: profile.id,
        ownedMaps: [],
        writableMaps: [],
        readableMaps: [],
      };

      try {
        await users.create(newUser);
      } catch (err) {
        log.error('Trouble creating user.', {
          email: user.email,
        });
        console.error(err);
        done(err);
      }
      user = newUser;
    }

    // For a user that has previously only used credentials
    if (user.uuid && !user.googleId) {
      try {
        await users.findOneAndUpdate(
          { uuid: user.uuid },
          {
            $set: {
              googleId: profile.id,
            },
          },
        );
        user.googleId = profile.id;
      } catch (err) {
        log.error('Trouble updating existing user.', {
          email: user.email,
          uuid: user.uuid,
        });
        console.error(err);
        done(err);
      }
      log.info('User updated.', {
        email: user.email,
        uuid: user.uuid,
      });
    }

    if (user) {
      done(null, user);
    } else {
      done(null, null);
    }
  },
));

export default nextConnect()
  .get(async (req, res) => {
    try {
      await connectMongo();
      const user = await authenticate('google', req, res);
      const token = jwt.sign(
        { uuid: user.uuid, time: new Date() },
        JWT_SECRET,
        {
          expiresIn: '6h',
        },
      );

      res.setHeader(
        'Set-Cookie',
        cookie.serialize('token', token, {
          httpOnly: true,
          maxAge: 6 * 60 * 60,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        }),
      );

      res.writeHead(302, {
        Location: `${process.env.SITE}/profile`,
      });
      res.end();
    } catch (error) {
      console.error(error);
      res.writeHead(302, {
        Location: `${process.env.SITE}/signin`,
      });
      res.end();
    }
  });
