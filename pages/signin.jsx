import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { useRouter } from 'next/router';
import { providers, csrfToken, signin } from 'next-auth/client';
import Layout from '../components/layout';

function SignIn({ elsewhereProviders }) {
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInEmailLocal, setSignInEmailLocal] = useState('');
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
      if (res.status === 200) {
        router.push('/profile');
      } else {
        throw new Error(await res.text());
      }
    } catch (error) {
      console.error('An unexpected error happened occurred:', error);
    }
  }

  function handleSignInEmailLocalFieldChange(event) {
    event.preventDefault();
    setSignInEmailLocal(event.target.value);
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
        {Object.values(elsewhereProviders).map((provider) => {
          if (provider.id === 'email') {
            return (
              <Grid item xs={12}>
                <Grid
                  container
                  direction="column"
                  justify="space-evenly"
                  alignItems="center"
                  spacing={2}
                >
                  <Grid item xs={12}>
                    <TextField
                      id="filled-basic"
                      value={signInEmailLocal}
                      label="Email address"
                      variant="filled"
                      onChange={(e) => handleSignInEmailLocalFieldChange(e)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      onClick={() => signin(
                        'email',
                        {
                          email: signInEmailLocal,
                          callbackUrl: `${process.env.SITE}/profile`,
                        },
                      )}
                    >
                      Sign in with Email
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            );
          }

          return (
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={() => signin(provider.id, { callbackUrl: `${process.env.SITE}/profile` })}
              >
                {`Sign in with ${provider.name}`}
              </Button>
            </Grid>
          );
        })}

        {/* This is username and password authentication */}
        <Grid item xs={12}>
          <TextField
            id="filled-basic"
            value={signInEmail}
            label="Email address"
            variant="filled"
            onChange={(e) => handleSignInEmailFieldChange(e)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="filled-basic"
            value={signInPassword}
            label="Password"
            variant="filled"
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
      </Grid>
    </Layout>
  );
}

SignIn.getInitialProps = async (context) => {
  const props = {
    elsewhereProviders: await providers(context),
  };

  if (process.env.NODE_ENV === 'development') {
    props.csrfToken = await csrfToken(context);
  }

  return props;
};

SignIn.propTypes = {
  elsewhereProviders: PropTypes.shape.isRequired,
};


export default SignIn;
