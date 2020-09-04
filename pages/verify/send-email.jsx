import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { useRouter } from 'next/router';
import Layout from '../../components/layout';

function ForgotPassword() {
  const [signInEmail, setSignInEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const router = useRouter();

  function handleSignInEmailFieldChange(event) {
    event.preventDefault();
    setSignInEmail(event.target.value);
    setEmailError(false);
  }
  async function handleRequestVerificationEmail(event) {
    event.preventDefault();

    const body = {
      email: signInEmail,
    };

    try {
      const res = await fetch('/api/local/verify/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 200) {
        router.push('/verify/');
      } else {
        setEmailError(true);
      }
    } catch (err) {
      setEmailError(true);
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
            onClick={handleRequestVerificationEmail}
          >
            Request Verification Email
          </Button>
        </Grid>
        {
          emailError ? (
            <Grid item xs={12}>
              <Typography variant="body1">Email could not be sent.</Typography>
            </Grid>
          ) : null
        }
      </Grid>
    </Layout>
  );
}

export default ForgotPassword;
