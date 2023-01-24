import React, { useState } from 'react';
import Link from 'next/link';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { useRouter } from 'next/router';
import Layout from '../components/layout';

function SignUp() {
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const router = useRouter();

  function handleSignUpEmailFieldChange(event) {
    event.preventDefault();
    setSignUpEmail(event.target.value);
  }

  function handleSignUpPasswordFieldChange(event) {
    event.preventDefault();
    setSignUpPassword(event.target.value);
  }

  async function handleEmailPasswordSignUp(event) {
    event.preventDefault();

    const body = {
      email: signUpEmail,
      password: signUpPassword,
    };

    try {
      const authServiceUrl = process.env.AUTH_SERVICE_URL;
      const applicationId = process.env.AUTH_SERVICE_APP_ID;
      const res = await fetch(`${authServiceUrl}/v1/applications/${applicationId}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 204) {
        router.push('/verify');
      }
      // If no previous cases were hit, we don't know what happened
      // TODO say there was an error, try again
    } catch (err) {
      // Do something?
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
            value={signUpEmail}
            label="Email address"
            variant="outlined"
            onChange={(e) => handleSignUpEmailFieldChange(e)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="filled-basic"
            value={signUpPassword}
            label="Password"
            variant="outlined"
            type="password"
            onChange={(e) => handleSignUpPasswordFieldChange(e)}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleEmailPasswordSignUp}
          >
            Sign Up
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Link href="/verify">Need to verify your email?</Link>
        </Grid>
      </Grid>
    </Layout>
  );
}

export default SignUp;
