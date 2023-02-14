import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import Layout from '../components/layout';
import MapList from '../components/mapList';
import LoadingPage from '../components/loadingPage';
import {
  elsewhereApiUrl,
  authenticationServiceUrl,
  applicationId,
  jwtCookieName,
} from '../utils/config';
import { getCookie } from '../utils/util';

function Profile() {
  const [id, setId] = useState('');
  const [maps, setMaps] = useState([]);
  const [newTripNameField, setNewTripNameField] = useState('');
  // token is the auth token held in a cookie
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const cookieToken = getCookie(jwtCookieName);
    setToken(cookieToken);
  }, []);

  useEffect(() => {
    if (!token || !router.isReady) {
      return;
    }

    fetch(`${authenticationServiceUrl}/v1/applications/${applicationId}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status !== 200) router.push('/signin');

        return res.json();
      })
      .then((data) => {
        setId(data.id);
      })
      .catch(() => {
        router.push('/signin');
      });

    fetch(`${elsewhereApiUrl}/v1/trip`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) router.push('/signin');
        if (res.status === 403) router.push('/signin');
        if (res.status !== 200) throw new Error('Unhandled status');
        return res.json();
      })
      .then((data) => {
        setMaps(data);
      })
      .catch(() => {
        // TODO show error
      });
  }, [router, token]);

  function handleNewTripNameFieldChange(event) {
    event.preventDefault();
    setNewTripNameField(event.target.value);
  }

  async function createTrip(event) {
    event.preventDefault();
    const vars = {
      name: newTripNameField,
    };

    setLoading(true);
    fetch(`${elsewhereApiUrl}/v1/trip`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vars),
    })
      .then((res) => {
        if (res.status !== 201) {
          throw new Error('Unhandled status');
        }

        return res.json();
      })
      .then((data) => {
        const newMaps = Array.from(maps);
        newMaps.push(data);
        setMaps(newMaps);
      })
      .catch(() => {
        // setErrorMsg(getErrorMessage(error));
      })
      .finally(() => {
        setLoading(false);
      });
  }

  if (id) {
    return (
      <Layout session={id}>
        <Grid
          container
          direction="column"
          justify="space-evenly"
          alignItems="stretch"
          spacing={3}
        >
          <Grid
            container
            direction="column"
            justify="space-evenly"
            alignItems="center"
          >
            <Grid item xs={12}>
              <Typography variant="h3">Trips</Typography>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            {
              maps.length ? (
                <MapList maps={maps} />
              )
                : null
            }
          </Grid>

          <Grid item xs={12}>
            <Grid
              container
              direction="column"
              justify="space-evenly"
              alignItems="flex-start"
              spacing={2}
            >
              <Grid item xs={12}>
                <Typography variant="h5">Create a new trip</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="filled-basic"
                  value={newTripNameField}
                  label="Name"
                  variant="standard"
                  onChange={(e) => handleNewTripNameFieldChange(e)}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={(e) => createTrip(e)}
                >
                  Create
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress />
        </Backdrop>
      </Layout>
    );
  }

  return <LoadingPage />;
}

export default Profile;
