import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Layout from '../components/layout';
import {
  authenticationServiceUrl,
  applicationId,
} from '../utils/config';

function Index() {
  const [id, setId] = useState('');

  useEffect(() => {
    fetch(`${authenticationServiceUrl}/v1/applications/${applicationId}/users/me`)
      .then((res) => {
        if (res.status !== 200) throw new Error('Not signed in');

        return res.json();
      })
      .then((data) => {
        setId(data.id);
      })
      .catch(() => {});
  }, []);

  return (
    <Layout session={id}>
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        spacing={0}
        sx={{
          height: '100vh',
        }}
      >
        <Grid item xs={12}>
          <Typography variant="h2">Let&apos;s go Elsewhere.</Typography>
        </Grid>
      </Grid>
    </Layout>
  );
}

export default Index;
