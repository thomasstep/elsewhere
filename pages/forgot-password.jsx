import React, { useState } from 'react';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { useRouter } from 'next/router';
import Layout from '../components/layout';

function ForgotPassword() {
  const [signInEmail, setSignInEmail] = useState('');
  const [loading, setLoading] = useState(false);
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
      const authServiceUrl = process.env.AUTH_SERVICE_URL;
      const applicationId = process.env.AUTH_SERVICE_APP_ID;
      const res = await fetch(`${authServiceUrl}/v1/applications/${applicationId}/users/password/reset?${new URLSearchParams(body)}`);
      if (res.status === 200) {
        router.push('/update-password');
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
            value={signInEmail}
            label="Email address"
            variant="standard"
            type="email"
            onChange={(e) => handleSignInEmailFieldChange(e)}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={(e) => {
              setLoading(true);
              handleRequestPasswordResetLink(e);
            }}
          >
            Request Password Reset Link
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

export default ForgotPassword;
