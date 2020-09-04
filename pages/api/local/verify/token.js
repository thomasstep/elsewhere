import bcrypt from 'bcrypt';
import { log } from '../../../../utils/log';
import { connectMongo, users } from '../../../../utils/db';

export default async (req, res) => {
  if (req.method === 'POST') {
    await connectMongo();
    const {
      body: { token },
    } = req;
    console.log(token)
    if (!token) {
      res.status(500).end();
      return null;
    }

    let user;
    try {
      user = await users.findOneAndUpdate(
        { verificationToken: token },
        {
          $set: {
            verified: true,
            verificationToken: null,
          },
        },
      );
    } catch (err) {
      log.error('Error getting user by verification token.', {
        token,
      });
      console.error(err);
      res.status(500).end();
    }
    log.info('User verified.', {
      user,
    });

    if (!user) {
      res.status(500).end();
      return null;
    }

    res.status(200).end();
    return null;
  }
  res.status(500).end();
  return null;
};
