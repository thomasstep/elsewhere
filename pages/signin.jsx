import React, { useState } from 'react';
import Link from 'next/link';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useRouter } from 'next/router';
import Layout from '../components/layout';
import { jwtCookieName } from '../utils/config';
import { setCookie } from '../utils/util';

function SignIn() {
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const router = useRouter();

  function handleSignInEmailFieldChange(event) {
    event.preventDefault();
    setSignInEmail(event.target.value);
  }

  function handleSignInPasswordFieldChange(event) {
    event.preventDefault();
    setSignInPassword(event.target.value);
  }

  async function handleEmailPasswordSignIn(event) {
    event.preventDefault();

    const body = {
      email: signInEmail,
      password: signInPassword,
    };

    try {
      const authServiceUrl = process.env.AUTH_SERVICE_URL;
      const applicationId = process.env.AUTH_SERVICE_APP_ID;
      const res = await fetch(`${authServiceUrl}/v1/applications/${applicationId}/users/token?${new URLSearchParams(body)}`);
      if (res.status === 200) {
        const resJson = await res.json();
        setCookie(jwtCookieName, resJson.token);
        router.push('/profile');
      }
      if (res.status === 401) {
        // TODO say wrong password
      }
      if (res.status === 404) {
        // TODO say user not found with given email, do you need to verify?
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
        {/* <Grid item xs={12}>
          <Button
            variant="contained"
            href="/api/google/signin"
          >
            Sign In With Google
          </Button>
        </Grid>

        <hr style={{ width: '100%' }} /> */}

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
          <TextField
            id="filled-basic"
            value={signInPassword}
            label="Password"
            variant="outlined"
            type="password"
            onChange={(e) => handleSignInPasswordFieldChange(e)}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleEmailPasswordSignIn}
          >
            Sign In
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Link href="/forgot-password">Forgot your password?</Link>
        </Grid>
      </Grid>
    </Layout>
  );
}

export default SignIn;
