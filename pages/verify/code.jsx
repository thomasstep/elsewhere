import React, { useState } from 'react';
import Link from 'next/link';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Layout from '../../components/layout';

function Index() {
  const [token, setToken] = useState('');
  const [verified, setVerified] = useState(null);

  function handleTokenFieldChange(event) {
    setToken(event.target.value);
  }

  function verifyToken() {
    const body = {
      token: token.trim(),
    };

    fetch('/api/local/verify/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (res.status === 200) {
          setVerified(true);
        } else {
          setVerified(false);
        }
      })
      .catch(() => {
        setVerified(false);
      });
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
            variant="outlined"
            type="text"
            onChange={(e) => handleTokenFieldChange(e)}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={verifyToken}
          >
            Verify Token
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
