import React, { useState } from 'react';
import Link from 'next/link';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { useRouter } from 'next/router';
import Layout from '../components/layout';
import { jwtCookieName } from '../utils/config';
import { setCookie } from '../utils/util';

function SignIn() {
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [loading, setLoading] = useState(false);
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
    } finally {
      setLoading(false);
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
            variant="standard"
            type="email"
            onChange={(e) => handleSignInEmailFieldChange(e)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="filled-basic"
            value={signInPassword}
            label="Password"
            variant="standard"
            type="password"
            onChange={(e) => handleSignInPasswordFieldChange(e)}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={(e) => {
              setLoading(true);
              handleEmailPasswordSignIn(e);
            }}
          >
            Sign In
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            component={Link}
            href="/forgot-password"
          >
            Forgot your password?
          </Button>
        </Grid>
      </Grid>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress />
      </Backdrop>
    </Layout>
  );
}

export default SignIn;
