import sgMail from '@sendgrid/mail';

export default async function sendVerificationEmail(email, uuid) {
  const verificationUrl = `${process.env.SITE}/verify/code`;
  const msg = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: 'Verify Email',
    html: `
    <p>
      An account with your email address has been created on Elsewhere. Here is your verification code.
    </p>

    <p>
      ${uuid}
    </p>

    <p>
      Please go to the following link and paste the token there.
    </p>
    <a href=${verificationUrl}>${verificationUrl}</a>`,
  };
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  await sgMail.send(msg);
}
