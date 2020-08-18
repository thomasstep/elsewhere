import React from 'react';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Layout from '../components/layout';

function Index() {
  return (
    <Layout session={{}}>
      <Box
        mt={10}
      >
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="center"
        >
          <Grid item xs={12}>
            <Typography variant="h5">Let&apos;s go</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h3">Elsewhere.</Typography>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}

export default Index;
