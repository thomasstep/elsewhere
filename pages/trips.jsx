import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Alert from '@mui/material/Alert';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';

import Layout from '../components/layout';
import TripList from '../components/tripList';
import LoadingPage from '../components/loadingPage';
import {
  applicationId,
  authenticationServiceUrl,
  elsewhereApiUrl,
  jwtCookieName,
  snackbarAutoCloseTime,
} from '../utils/config';
import {
  attemptRefresh,
  getCookie,
} from '../utils/util';

function Trips() {
  const limit = 20;
  const [id, setId] = useState('');
  const [trips, setTrips] = useState([]);
  const [newTripNameField, setNewTripNameField] = useState('');
  // token is the auth token held in a cookie
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [nextToken, setNextToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const cookieToken = getCookie(jwtCookieName);
    if (!cookieToken) {
      (async () => {
        const refreshed = await attemptRefresh();
        if (refreshed) {
          setToken(refreshed);
        } else {
          router.push('/signin');
        }
      })();
    } else {
      setToken(cookieToken);
    }
  }, []);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (!token || !router.isReady) {
      return () => {};
    }

    fetch(`${authenticationServiceUrl}/v1/applications/${applicationId}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      // eslint-disable-next-line consistent-return
      .then((res) => {
        if (res.status !== 200) {
          (async () => {
            const refreshed = await attemptRefresh();
            if (refreshed) {
              router.reload();
            } else {
              router.push('/signin');
            }
          })();
        } else {
          return res.json();
        }
      })
      .then((data) => {
        setId(data.id);
      })
      .catch(() => {
        router.push('/signin');
      });

    fetch(`${elsewhereApiUrl}/v1/trip?${new URLSearchParams({ limit })}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          (async () => {
            const refreshed = await attemptRefresh();
            if (refreshed) {
              router.reload();
            } else {
              router.push('/signin');
            }
          })();
        }

        if (res.status === 403) {
          (async () => {
            const refreshed = await attemptRefresh();
            if (refreshed) {
              router.reload();
            } else {
              router.push('/signin');
            }
          })();
        }

        if (res.status !== 200) throw new Error('Unhandled status');
        return res.json();
      })
      .then((data) => {
        const resTrips = data.trips;
        const resNextToken = data.pagination.nextToken;
        setTrips(resTrips);
        if (resTrips.length === limit && resNextToken) {
          setNextToken(resNextToken);
        }
      })
      .catch(() => {
        setSnackbarMessage('Could not load trips. Please reload or try again later.');
        setSnackbarOpen(true);
      });
  }, [router, token]);

  // Scroll through pagination
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (!nextToken) return () => {};

    const params = {
      limit,
      nextToken,
    };
    fetch(`${elsewhereApiUrl}/v1/trip?${new URLSearchParams(params)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          (async () => {
            const refreshed = await attemptRefresh();
            if (refreshed) {
              router.reload();
            } else {
              router.push('/signin');
            }
          })();
        }

        if (res.status === 403) {
          (async () => {
            const refreshed = await attemptRefresh();
            if (refreshed) {
              router.reload();
            } else {
              router.push('/signin');
            }
          })();
        }

        if (res.status !== 200) throw new Error('Unhandled status');
        return res.json();
      })
      .then((data) => {
        const resTrips = data.trips;
        const resNextToken = data.pagination.nextToken;
        const newTrips = Array.from(trips);
        newTrips.push(...resTrips);
        setTrips(newTrips);
        if (resTrips.length === limit && resNextToken) {
          setNextToken(resNextToken);
        }
      })
      .catch(() => {
        setSnackbarMessage('Could not load all trips. Some trips will be missing.');
        setSnackbarOpen(true);
      });
  }, [nextToken]);

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
        const newTrips = Array.from(trips);
        newTrips.push(data);
        setTrips(newTrips);
      })
      .catch(() => {
        setSnackbarMessage('Could not create a new trip. Please try again later.');
        setSnackbarOpen(true);
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
              trips.length ? (
                <TripList trips={trips} />
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

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={snackbarAutoCloseTime}
          onClose={(event, reason) => {
            if (reason === 'clickaway') {
              return;
            }

            setSnackbarOpen(false);
          }}
        >
          <Alert
            severity="error"
            variant="outlined"
            onClose={(event, reason) => {
              if (reason === 'clickaway') {
                return;
              }

              setSnackbarOpen(false);
            }}
            sx={{
              width: '100%',
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Layout>
    );
  }

  return <LoadingPage />;
}

export default Trips;
