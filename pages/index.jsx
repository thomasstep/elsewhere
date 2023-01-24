import React, { useState, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Layout from '../components/layout';
import {
  elsewhereApiUrl,
  authenticationServiceUrl,
  applicationId,
} from '../utils/config';

function Index() {
  const [id, setId] = useState('');

  useEffect(() => {
    fetch(`${authenticationServiceUrl}/v1/applications/${applicationId}/users/me`)
    .then((res) => {
      if (res.status !== 200) router.push('/signin');

      data = res.json()
      setId(data.id);
    })
      .catch(() => {});
  }, []);

  return (
    <Layout session={id}>
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
            <Typography variant="h1">Map out your plan together.</Typography>
          </Grid>
          <Grid item xs={12} sm={8} md={4}>
            <Typography variant="body1">Whether you are planning a day in the city or an international trip, Elsewhere was made to collaboratively map out your plan.</Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid
              container
              direction="row"
              justify="flex-start"
              alignItems="center"
            >
              <Grid item xs={12}>
                <Typography variant="h2">Let&apos;s go</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h1">Elsewhere.</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
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
            <Typography variant="h2">A Little About Elsewhere</Typography>
          </Grid>
          <Grid item xs={12} sm={8} md={4}>
            <Typography variant="body1">Create a map and start adding places that you want to go. You can take notes and name your places however you like. Elsewhere is meant to help you keep track of the places you have been and want to go to in the future. You can use Elsewhere as a geographic agenda, trip planner, or whatever else you can think of. The points that you place go exactly where you want. Try it out, it&apos;s free.</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h2">My Motivation For Building Elsewhere</Typography>
          </Grid>
          <Grid item xs={12} sm={8} md={4}>
            <Typography variant="body1">I was trying to plan an international trip using a combination of Google Maps, a spreadsheet, and notes. Keeping track of where I wanted to go while I was traveling was complicated. Even after I made a list of places to go, being able to share that list and notes was complicated and hard to keep track of. I looked online to find an alternative, but I could not find anything, which is when the idea for Elsewhere was born. I wanted Elsewhere to be completely open to however you want to use it. The markers you place on a map do not snap to known locations, and you can keep your thoughts and other options noted down right alongside your markers.</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h2">Do You Have Feedback Or Suggestions For Elsewhere?</Typography>
          </Grid>
          <Grid item xs={12} sm={8} md={4}>
            <Typography variant="body1">If you need any support, have positive or negative feedback, or have a suggestion for something you would like to see in Elsewhere, please feel free to email me at tstep916@gmail.com.</Typography>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}

export default Index;
