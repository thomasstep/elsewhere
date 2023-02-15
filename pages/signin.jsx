import React, { useState } from 'react';
import Link from 'next/link';
import Alert from '@mui/material/Alert';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import { useRouter } from 'next/router';
import Layout from '../components/layout';

import {
  snackbarAutoCloseTime,
  jwtCookieName,
} from '../utils/config';
import { setCookie } from '../utils/util';

function SignIn() {
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
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
      if (res.status !== 200) {
        if (res.status === 401) {
          setSnackbarMessage('Incorrect password.');
        }

        if (res.status === 404) {
          setSnackbarMessage('User with email not found. Do you need to verify?');
        }

        // If no previous cases were hit, we don't know what happened
        setSnackbarOpen(true);
      } else {
        // Successful sign in
        const resJson = await res.json();
        setCookie(jwtCookieName, resJson.token);
        router.push('/trips');
      }
    } catch (err) {
      setSnackbarOpen(true);
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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={snackbarAutoCloseTime}
        onClose={(event, reason) => {
          if (reason === 'clickaway') {
            return;
          }

          setSnackbarOpen(false);
        }}
      >
        <Alert
          severity="error"
          variant="outlined"
          onClose={(event, reason) => {
            if (reason === 'clickaway') {
              return;
            }

            setSnackbarOpen(false);
          }}
          sx={{
            width: '100%',
          }}
        >
          {snackbarMessage || 'Could not sign in. Please try again later.'}
        </Alert>
      </Snackbar>
    </Layout>
  );
}

export default SignIn;
