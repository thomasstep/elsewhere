import React from 'react';
import Link from 'next/link';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Layout from '../../components/layout';

function EmailSent() {
  return (
    <Layout>
      <Box
        mt={9}
      >
        <Grid
          container
          direction="column"
          justify="flex-start"
          alignItems="center"
          spacing={9}
        >
          <Grid item xs={12}>
            <Typography variant="h3">
              Email could not be sent.&nbsp;
              <Link href="/signin">
                <a>Please try again.</a>
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}

export default EmailSent;
