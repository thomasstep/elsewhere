import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Layout from '../../components/layout';
import LoadingPage from '../../components/loadingPage';

function Index() {
  const router = useRouter();
  const [resetSuccess, setResetSuccess] = useState(null);
  const [password, setPassword] = useState('');

  function handlePasswordFieldChange(event) {
    setPassword(event.target.value);
  }

  function resetPassword() {
    const token = router.query.id;

    const body = {
      token,
      password,
    };

    fetch('/api/local/forgot-password/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (res.status === 200) {
          setResetSuccess(true);
        } else {
          setResetSuccess(false);
        }
      })
      .catch(() => {
        setResetSuccess(false);
      });
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
          <Button
            variant="contained"
            onClick={resetPassword}
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

export default Index;
