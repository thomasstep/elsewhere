import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';

import Layout from './layout';

function LoadingPage() {
  return (
    <Layout session={null}>
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: '100vh' }}
      >
        <Grid item xs={2}>
          <CircularProgress />
        </Grid>
      </Grid>
    </Layout>
  );
}

export default LoadingPage;
