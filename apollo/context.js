const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const { users, log } = require('../utils');

const { JWT_SECRET } = process.env;

async function context(ctx) {
  const { req } = ctx;

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
    }
  } else {
    log.info('No token found.');
  }

  return ctx;
}

module.exports = {
  context,
};
