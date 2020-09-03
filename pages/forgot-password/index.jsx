import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { useRouter } from 'next/router';
import Layout from '../../components/layout';

function ForgotPassword() {
  const [signInEmail, setSignInEmail] = useState('');
  const router = useRouter();

  function handleSignInEmailFieldChange(event) {
    event.preventDefault();
    setSignInEmail(event.target.value);
  }
  async function handleRequestPasswordResetLink(event) {
    event.preventDefault();

    const body = {
      email: signInEmail,
    };

    try {
      const res = await fetch('/api/local/forgot-password/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 200) {
        router.push('/forgot-password/email-sent');
      } else {
        router.push('/forgot-password/email-not-sent');
      }
    } catch (err) {
      router.push('/forgot-password/email-not-sent');
    }
  }

  return (
    <Layout>
      <Grid
        container
        direction="column"
        justify="space-evenly"
        alignItems="center"
        spacing={5}
      >
        <Grid item xs={12}>
          <TextField
            id="filled-basic"
            value={signInEmail}
            label="Email address"
            variant="outlined"
            onChange={(e) => handleSignInEmailFieldChange(e)}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleRequestPasswordResetLink}
          >
            Request Password Reset Link
          </Button>
        </Grid>
      </Grid>
    </Layout>
  );
}

export default ForgotPassword;
