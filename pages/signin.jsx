import React, { useState } from 'react';
import Link from 'next/link';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { useRouter } from 'next/router';
import Layout from '../components/layout';

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
      const res = await fetch('/api/local/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const resJson = await res.json();
      console.log(resJson)
      if (resJson.done && resJson.verified) {
        router.push('/profile');
      }
      if (!resJson.verified) {
        router.push('/verify');
      }
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
          <Button
            variant="contained"
            href="/api/google/signin"
          >
            Sign In With Google
          </Button>
        </Grid>

        <hr style={{ width: '100%' }} />
        {/* This is username and password authentication */}
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
            Sign In With Email
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
