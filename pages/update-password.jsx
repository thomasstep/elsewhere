import React, { useState } from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Layout from '../components/layout';

function UpdatePassword() {
  const [resetSuccess, setResetSuccess] = useState(null);
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');

  function handlePasswordFieldChange(event) {
    setPassword(event.target.value);
  }

  function handleTokenFieldChange(event) {
    setToken(event.target.value);
  }

  async function resetPassword() {
    const body = {
      token,
      password,
    };

    try {
      const authServiceUrl = process.env.AUTH_SERVICE_URL;
      const applicationId = process.env.AUTH_SERVICE_APP_ID;
      const res = await fetch(`${authServiceUrl}/v1/applications/${applicationId}/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 200) {
        setResetSuccess(true);
      } else {
        setResetSuccess(false);
      }
    } catch (err) {
      // Do something?
      setResetSuccess(false);
    }
  }

  let successMessage = null;

  if (resetSuccess === true) {
    successMessage = (
      <Typography variant="body1">Password successfully reset.</Typography>
    );
  }

  if (resetSuccess === false) {
    successMessage = (
      <Typography variant="body1">Password could not be reset.</Typography>
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
            value={password}
            label="Password"
            variant="outlined"
            type="password"
            onChange={(e) => handlePasswordFieldChange(e)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="filled-basic"
            value={token}
            label="Token"
            variant="outlined"
            type="text"
            onChange={(e) => handleTokenFieldChange(e)}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={(e) => resetPassword(e)}
          >
            Reset Password
          </Button>
        </Grid>
        <Grid item xs={12}>
          {successMessage}
        </Grid>
      </Grid>
    </Layout>
  );
}

export default UpdatePassword;