import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';

import Alert from '@mui/material/Alert';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import Layout from '../../../components/layout';
import {
  applicationId,
  authenticationServiceUrl,
  elsewhereApiUrl,
  jwtCookieName,
  snackbarAutoCloseTime,
} from '../../../utils/config';
import {
  attemptRefresh,
  getCookie,
} from '../../../utils/util';

function ElsewhereTripSettings() {
  const router = useRouter();
  const [id, setId] = useState('');
  const [tripName, setTripName] = useState('');
  const [editedTripName, setEditedTripName] = useState('');
  const [writers, setWriters] = useState(new Set());
  const [token, setToken] = useState(null);
  const [travelPartnerTextField, setTravelPartnerTextField] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    let cookieToken;
    cookieToken = getCookie(jwtCookieName);
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

  useEffect(() => {
    if (!token || !router.isReady) {
      return () => {};
    }

    fetch(`${authenticationServiceUrl}/v1/applications/${applicationId}/users/me`, {
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

        if (res.status !== 200) router.push('/trips');

        return res.json();
      })
      .then((data) => {
        setId(data.id);
      })
      .catch(() => {
          (async () => {
            const refreshed = await attemptRefresh();
            if (refreshed) {
              router.reload();
            } else {
              router.push('/signin');
            }
          })();
      });

    fetch(`${elsewhereApiUrl}/v1/trip/${router.query.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 200) return res.json();

        throw new Error('Unhandled status');
      })
      .then((data) => {
        setTripName(data.name);
        // Initialize this so it doesn't automatically change trip name to ''
        setEditedTripName(data.name);
        const newWriters = new Set();
        // eslint-disable-next-line no-restricted-syntax
        for (const collaborator of data.collaborators) {
          if (collaborator !== data.createdBy) {
            // eslint-disable-next-line no-await-in-loop
            fetch(`${authenticationServiceUrl}/v1/applications/${applicationId}/users?${new URLSearchParams({ id: collaborator })}`)
              .then((res) => {
                if (res.status === 200) return res.json();

                throw new Error('Unhandled status');
              })
              .then((userData) => {
                newWriters.add(userData.email);
                setWriters(newWriters);
              })
              .catch(() => {
                setSnackbarMessage('Could not read travel partner info. Please try again later.');
                setSnackbarOpen(true);
              });
          }
        }
      })
      .catch(() => {
        setSnackbarMessage('Could not read trip info. Please try again later.');
        setSnackbarOpen(true);
      });
  }, [router, token]);

  async function saveTripName() {
    if (tripName !== editedTripName) {
      const updates = {
        name: editedTripName,
      };

      setLoading(true);
      fetch(`${elsewhereApiUrl}/v1/trip/${router.query.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })
        .then((res) => {
          if (res.status === 200) {
            setTripName(editedTripName);
            setEditedTripName(editedTripName);
          } else {
            setSnackbarMessage('Could not update trip name. Please try again later.');
            setSnackbarOpen(true);
          }
        })
        .catch(() => {
          setSnackbarMessage('Could not remove travel partner. Please try again later.');
          setSnackbarOpen(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }

  async function deleteTrip(event) {
    event.preventDefault();

    fetch(`${elsewhereApiUrl}/v1/trip/${router.query.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 204) {
          router.push('/trips');
        } else {
          setSnackbarMessage('Could not delete trip. Please try again later.');
          setSnackbarOpen(true);
        }
      })
      .catch(() => {
        setSnackbarMessage('Could not delete trip. Please try again later.');
        setSnackbarOpen(true);
      });
  }

  function handleTravelBuddyTextFieldChange(event) {
    setTravelPartnerTextField(event.target.value);
  }

  function handleTripNameTextFieldChange(event) {
    setEditedTripName(event.target.value);
  }

  async function addTravelPartner(event) {
    event.preventDefault();

    const updates = {
      email: travelPartnerTextField,
    };

    setLoading(true);
    fetch(`${elsewhereApiUrl}/v1/trip/${router.query.id}/collaborator`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    })
      .then((res) => {
        if (res.status === 200) {
          const newWriters = new Set(writers);
          newWriters.add(travelPartnerTextField);
          setWriters(newWriters);
        } else {
          setSnackbarMessage('Could not add travel partner. Please try again later.');
          setSnackbarOpen(true);
        }
      })
      .catch(() => {
        setSnackbarMessage('Could not add travel partner. Please try again later.');
        setSnackbarOpen(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function removeTravelPartner(event, email) {
    event.preventDefault();

    const updates = {
      email,
    };

    setLoading(true);
    fetch(`${elsewhereApiUrl}/v1/trip/${router.query.id}/collaborator`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    })
      .then((res) => {
        if (res.status === 200) {
          const newWriters = new Set(writers);
          newWriters.delete(email);
          setWriters(newWriters);
        } else {
          setSnackbarMessage('Could not remove travel partner. Please try again later.');
          setSnackbarOpen(true);
        }
      })
      .catch(() => {
        setSnackbarMessage('Could not remove travel partner. Please try again later.');
        setSnackbarOpen(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <Layout session={id}>
      <Grid
        container
        direction="column"
        justify="space-evenly"
        alignItems="stretch"
        spacing={3}
      >

        <Grid item xs={12}>
          <Grid
            container
            direction="column"
            justify="space-evenly"
            alignItems="center"
            spacing={2}
          >
            <Grid item xs={12}>
              <Typography variant="h3">Settings</Typography>
            </Grid>
            {/* Trip Name */}
            <Grid item xs={12}>
              <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
                spacing={2}
              >
                <Grid item>
                  <TextField
                    id="filled-basic"
                    value={editedTripName}
                    label="Trip Name"
                    variant="standard"
                    onChange={(e) => handleTripNameTextFieldChange(e)}
                  />
                </Grid>
                <Grid item>
                  <IconButton
                    aria-label="save"
                    onClick={() => saveTripName()}
                  >
                    <SaveIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Travel Partners */}
        <Grid item xs={12}>
          {
          writers.size ? (
            <>
              <Typography variant="h5">Travel Partners</Typography>
              <List component="nav">
                {Array.from(writers).map((email) => (
                  <React.Fragment key={email}>
                    <ListItem button>
                      <ListItemText primary={email} />
                      <IconButton
                        aria-label="delete"
                        // className={classes.deleteTravelPartnerButton}
                        onClick={(e) => removeTravelPartner(e, email)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </>
          )
            : (
              null
            )
          }
        </Grid>

        {/* Add Travel Partner */}
        <Grid item xs={12}>
          <Grid
            container
            direction="column"
            justify="space-evenly"
            alignItems="flex-start"
            spacing={2}
          >
            <Grid item xs={12}>
              <TextField
                id="filled-basic"
                value={travelPartnerTextField}
                label="Email"
                variant="standard"
                onChange={(e) => handleTravelBuddyTextFieldChange(e)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={(e) => addTravelPartner(e)}
              >
                Add Travel Partner
              </Button>
            </Grid>
          </Grid>
        </Grid>

        {/* Delete Trip Button */}
        <Grid item xs={12}>
          <Grid
            container
            direction="column"
            justify="space-evenly"
            alignItems="center"
          >
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={(e) => deleteTrip(e)}
              >
                Delete Trip
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

export default ElsewhereTripSettings;
