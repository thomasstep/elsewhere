const { v4 } = require('uuid');
const { getSession, setOptions } = require('next-auth/client');
const { users, log } = require('../utils');

setOptions({ site: process.env.SITE });

async function context(ctx) {
  const { req } = ctx;
  const { user } = await getSession({ req });
  if (user && user.email) {
    let foundUser = await users.findOne({ email: user.email });

    // There are some instances in which a user will not be created by the NextAuth event
    // A successful getSession call means they are a legitimate user
    if (!foundUser) {
      const uuid = v4();
      try {
        foundUser = await users.create(
          {
            uuid,
            email: user.email,
            ownedMaps: [],
            writableMaps: [],
            readableMaps: [],
          },
        );
      } catch (err) {
        log.error('Error creating new user.', {
          nextauthUser: user,
          uuid,
          email: user.email,
        });
        log.error(err);
      }
    }

    ctx.user = foundUser;
    ctx.user.id = foundUser.uuid;
  }

  return ctx;
}

module.exports = {
  context,
};
