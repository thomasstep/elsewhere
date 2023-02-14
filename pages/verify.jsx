import { useRouter } from 'next/router';
import React, { useState } from 'react';
import Link from 'next/link';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Layout from '../components/layout';

function Verify() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [verified, setVerified] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleTokenFieldChange(event) {
    setToken(event.target.value);
  }

  async function verifyToken() {
    const body = {
      token: token.trim(),
    };

    try {
      const authServiceUrl = process.env.AUTH_SERVICE_URL;
      const applicationId = process.env.AUTH_SERVICE_APP_ID;
      const res = await fetch(`${authServiceUrl}/v1/applications/${applicationId}/users/verification?${new URLSearchParams(body)}`);
      if (res.status === 204) {
        setVerified(true);
        router.push('/signin');
      }
      // If no previous cases were hit, we don't know what happened
      // TODO say there was an error, try again
      setVerified(false);
    } catch (err) {
      // Do something?
    }
  }

  let successMessage = null;

  if (verified === true) {
    successMessage = (
      <Typography variant="body1">
        You have been verified.&nbsp;
        <Link href="/signin">
          <a>Please sign in.</a>
        </Link>
      </Typography>
    );
  }

  if (verified === false) {
    successMessage = (
      <Typography variant="body1">You have not been verified.</Typography>
    );
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
            value={token}
            label="Code"
            variant="standard"
            type="text"
            onChange={(e) => handleTokenFieldChange(e)}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={(e) => {
              setLoading(true);
              verifyToken(e);
            }}
          >
            Verify Code
          </Button>
        </Grid>
        <Grid item xs={12}>
          {successMessage}
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

export default Verify;
