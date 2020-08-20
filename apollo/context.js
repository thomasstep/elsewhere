const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-micro');
const { connectMongo, users } = require('../utils/db');
const { log } = require('../utils');

const { JWT_SECRET } = process.env;

async function context(ctx) {
  const { req } = ctx;
  await connectMongo();

  const { token } = cookie.parse(req.headers.cookie ?? '');
  if (token) {
    try {
      const { uuid } = jwt.verify(token, JWT_SECRET);
      const user = await users.findOne({ uuid });

      log.info('User found from token.', {
        email: user.email,
      });
      ctx.user = user;
    } catch (err) {
      log.error(err);
      throw new AuthenticationError('Please log in.');
    }
  } else {
    log.info('No token found.');
    throw new AuthenticationError('Please log in.');
  }

  return ctx;
}

module.exports = {
  context,
};
