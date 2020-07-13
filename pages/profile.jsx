import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/client';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Layout from '../components/layout';
import MapList from '../components/mapList';
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

const useStyles = makeStyles({
  gridItem: {
    textAlign: 'center',
  },
});

function Profile({ session }) {
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [ownedMaps, setOwnedMap] = useState([]);
  const [readableMaps, setReadableMaps] = useState([]);
  const [writableMaps, setWritableMaps] = useState([]);
  const router = useRouter();
  const classes = useStyles();

  useEffect(() => {
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
        console.log(err)
      });
  }, []);

  if (id) {
    const sharedMaps = [...writableMaps, ...readableMaps];
    return (
      <Layout>
        <Grid container>
          <Grid item xs={12} />
          <Grid item xs={12} className={classes.gridItem}>
            <Typography variant="h3">Profile</Typography>
          </Grid>
          <Grid item xs={12} className={classes.gridItem}>
            <Typography variant="h5">{email}</Typography>
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

  return <p>Loading...</p>;
}

Profile.getInitialProps = async (context) => {
  return {
    session: await getSession(context),
  };
};

Profile.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  session: PropTypes.object.isRequired,
};

export default Profile;
