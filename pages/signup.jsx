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
} from '../utils/config';

function SignUp() {
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
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
      if (res.status !== 204) {
        setSnackbarOpen(true);
      } else {
        // Successful sign up
        router.push('/verify');
      }
    } catch (err) {
      setSnackbarOpen(true);
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
            variant="standard"
            type="email"
            onChange={(e) => handleSignUpEmailFieldChange(e)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="filled-basic"
            value={signUpPassword}
            label="Password"
            variant="standard"
            type="password"
            onChange={(e) => handleSignUpPasswordFieldChange(e)}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={(e) => {
              setLoading(true);
              handleEmailPasswordSignUp(e);
            }}
          >
            Sign Up
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            component={Link}
            href="/verify"
          >
            Need to verify your email?
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
          {snackbarMessage || 'Could not sign up. Please try again later.'}
        </Alert>
      </Snackbar>
    </Layout>
  );
}

export default SignUp;
