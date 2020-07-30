import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/client';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Layout from '../components/layout';
import MapList from '../components/mapList';
import LoadingPage from '../components/loadingPage';
import { fetcher } from '../utils/fetcher';

const viewerQuery = `{
    viewer {
      id
      email
      ownedMaps
      readableMaps
      writableMaps
    }
  }`;

function Profile({ session }) {
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [ownedMaps, setOwnedMap] = useState([]);
  const [readableMaps, setReadableMaps] = useState([]);
  const [writableMaps, setWritableMaps] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!session) router.push('/signin');

    fetcher(viewerQuery)
      .then(({
        viewer: {
          id: viewerId,
          email: viewerEmail,
          ownedMaps: viewerOwnedMaps,
          readableMaps: viewerReadableMaps,
          writableMaps: viewerWritableMaps,
        },
      }) => {
        setId(viewerId);
        setEmail(viewerEmail);
        setOwnedMap(viewerOwnedMaps);
        setReadableMaps(viewerReadableMaps);
        setWritableMaps(viewerWritableMaps);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  if (id) {
    const sharedMaps = [...writableMaps, ...readableMaps];
    return (
      <Layout session={session}>
        <Grid
          container
          direction="column"
          justify="space-evenly"
          alignItems="stretch"
        >
          <Grid
            container
            direction="column"
            justify="space-evenly"
            alignItems="center"
          >
            <Grid item xs={12}>
              <Typography variant="h3">Profile</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5">{email}</Typography>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            {
            ownedMaps.length ? (
              <>
                <Typography variant="h5">Your maps</Typography>
                <MapList mapList={ownedMaps} />
              </>
            )
              : null
            }

            {
            sharedMaps.length ? (
              <>
                <Typography variant="h5">Maps shared with you</Typography>
                <MapList mapList={sharedMaps} />
              </>
            )
              : null
            }
          </Grid>
        </Grid>
      </Layout>
    );
  }

  return <LoadingPage />;
}

Profile.getInitialProps = async (context) => ({
  session: await getSession(context),
});

Profile.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  session: PropTypes.object.isRequired,
};

export default Profile;
