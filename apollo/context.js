const { getSession, setOptions } = require('next-auth/client');
const { users } = require('../utils');

setOptions({ site: process.env.SITE });

async function context(ctx) {
  const { req } = ctx;
  const { user } = await getSession({ req });
  if (user && user.email) {
    const foundUser = await users.findOne({ email: user.email });
    ctx.user = foundUser;
    ctx.user.id = foundUser.uuid;
  }

  return ctx;
}

module.exports = {
  context,
};
