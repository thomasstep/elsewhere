import React, { useState } from 'react';
import Alert from '@mui/material/Alert';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import { useRouter } from 'next/router';
import Layout from '../components/layout';

function ForgotPassword() {
  const [signInEmail, setSignInEmail] = useState('');
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
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
      if (res.status !== 200) {
        setSnackbarOpen(true);
      } else {
        // Email successfully sent
        router.push('/update-password');
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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={60000}
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
          {snackbarMessage || 'Could not send email. Please try again later.'}
        </Alert>
      </Snackbar>
    </Layout>
  );
}

export default ForgotPassword;
