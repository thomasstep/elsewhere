import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { providers, csrfToken, signin } from 'next-auth/client';
import Layout from '../components/layout';

function SignIn({ elsewhereProviders }) {
  const [signInEmail, setSignInEmail] = useState('');

  function handleSignInEmailFieldChange(event) {
    event.preventDefault();
    setSignInEmail(event.target.value);
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
                      value={signInEmail}
                      label="Email address"
                      variant="filled"
                      onChange={(e) => handleSignInEmailFieldChange(e)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      onClick={() => signin(
                        'email',
                        {
                          email: signInEmail,
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
