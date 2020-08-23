import React, { useState, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Layout from '../components/layout';
import { fetcher } from '../utils/fetcher';

const viewerQuery = `{
  viewer {
    email
  }
}`;

function Index() {
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    fetcher(viewerQuery)
      .then(({
        viewer: {
          email: viewerEmail,
        },
      }) => {
        setUserEmail(viewerEmail);
      })
      .catch(() => {});
  }, []);

  return (
    <Layout session={userEmail}>
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
