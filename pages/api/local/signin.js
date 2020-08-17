import passport from 'passport';
import Local from 'passport-local';
import nextConnect from 'next-connect';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { users } from '../../../utils/db';
import { log } from '../../../utils';

const authenticate = (method, req, res) => new Promise((resolve, reject) => {
  passport.authenticate(
    method,
    {
      session: false,
      successRedirect: '/profile',
      failureRedirect: '/signin',
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

const { JWT_SECRET } = process.env;

function validPassword(user, password) {
  return bcrypt.compareSync(password, user.hashedPassword);
}

passport.use(new Local.Strategy(
  {
    usernameField: 'email',
  },
  async (email, password, done) => {
    const user = await users.findOne({ email });

    // For a user that has previously only used OAuth providers
    if (user.uuid && !user.hashedPassword) {
      try {
        const salt = bcrypt.genSaltSync();
        const hashedPassword = bcrypt.hashSync(password, salt);
        await users.findOneAndUpdate(
          { uuid: user.uuid },
          {
            $set: {
              hashedPassword,
            },
          },
        );
        user.hashedPassword = hashedPassword;
      } catch (err) {
        log.error('Trouble creating user.', {
          email: user.email,
          uuid: user.uuid,
        });
        console.error(err);
        done(err);
      }
      log.info('User created.', {
        email: user.email,
        uuid: user.uuid,
      });
    }

    if (user && validPassword(user, password)) {
      done(null, user);
    } else {
      done(null, null);
    }
  },
));

export default nextConnect()
  .use(passport.initialize())
  .post(async (req, res) => {
    try {
      const user = await authenticate('local', req, res);
      // session is the payload to save in the token, it may contain basic info about the user
      // const session = { ...user };
      // The token is a string with the encrypted session
      // const token = await encryptSession(session);
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

      // setTokenCookie(res, token);
      res.status(200).send({ done: true });
    } catch (error) {
      console.error(error);
      res.status(401).send(error.message);
    }
  });
