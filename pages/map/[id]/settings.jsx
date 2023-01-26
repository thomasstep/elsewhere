import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
// import { makeStyles } from '@mui/styles';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Layout from '../../../components/layout';
import LoadingPage from '../../../components/loadingPage';
import {
  elsewhereApiUrl,
  authenticationServiceUrl,
  applicationId,
  jwtCookieName,
} from '../../../utils/config';
import {
  getCookie,
} from '../../../utils/util';

// const useStyles = makeStyles((theme) => ({
//   deleteButton: {
//     color: 'white',
//     backgroundColor: theme.palette.error.main,
//     '&:hover': {
//       backgroundColor: theme.palette.error.dark,
//     },
//   },
//   deleteTravelPartnerButton: {
//     '&:hover': {
//       backgroundColor: theme.palette.error.main,
//     },
//   },
// }));

function ElsewhereMapSettings(props) {
  const router = useRouter();
  const [id, setId] = useState('');
  const [mapId] = useState(router.query.id);
  const [mapName, setMapName] = useState('');
  const [editedMapName, setEditedMapName] = useState('');
  const [writers, setWriters] = useState(null);
  const [token, setToken] = useState(getCookie(jwtCookieName));
  const [travelPartnerTextField, setTravelPartnerTextField] = useState('');
  // const classes = useStyles(props);

  useEffect(async () => {
    setToken(getCookie(jwtCookieName));
    console.log(`TOKEN: ${token}`)
    fetch(`${authenticationServiceUrl}/v1/applications/${applicationId}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
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

    fetch(`${elsewhereApiUrl}/v1/trip/${router.query.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status !== 200) console.log('REFRESH');

        return res.json();
      })
      .then(async (data) => {
        setMapName(data.name);
        // Initialize this so it doesn't automatically change map name to ''
        setEditedMapName(data.name);
        const writers = new Set();
        for (const collaborator of data.collaborators) {
          if (collaborator !== data.createdBy){
            const res = await fetch(`${authenticationServiceUrl}/v1/applications/${applicationId}/users?${new URLSearchParams({id: collaborator})}`);
            if (res.status === 200) {
              const data = await res.json();
              writers.add(data.email);
            }
          }
        }
        setWriters(writers);
        console.log(`writers: ${writers}`)
      });
  }, []);

  async function saveMapName() {
    if (mapName !== editedMapName) {
      const updates = {
        name: editedMapName,
      };

      fetch(`${elsewhereApiUrl}/v1/trip/${router.query.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })
        .then((res) => {
          if (res.status === 200) {
            setMapName(editedMapName);
            setEditedMapName(editedMapName);
          } else {
            // TODO return error
          }
        });
    }
  }

  async function deleteMap(event) {
    event.preventDefault();

    fetch(`${elsewhereApiUrl}/v1/trip/${router.query.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 204) {
          router.push('/profile');
        } else {
          // TODO return error
        }
      });
  }

  function handleTravelBuddyTextFieldChange(event) {
    setTravelPartnerTextField(event.target.value);
  }

  function handleMapNameTextFieldChange(event) {
    setEditedMapName(event.target.value);
  }

  async function addTravelPartner(event) {
    event.preventDefault();

    const updates = {
      email: travelPartnerTextField,
    };

    fetch(`${elsewhereApiUrl}/v1/trip/${router.query.id}/collaborator`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    })
      .then((res) => {
        if (res.status === 200) {
          writers.add(travelPartnerTextField);
          setWriters(writers); // Do I need to do this?
          console.log(`added: ${writers}`)
        } else {
          // TODO return error
        }
      });
  }

  async function removeTravelPartner(event, email) {
    event.preventDefault();

    const updates = {
      email,
    };

    fetch(`${elsewhereApiUrl}/v1/trip/${router.query.id}/collaborator`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    })
      .then((res) => {
        if (res.status === 200) {
          writers.delete(email);
          setWriters(writers);
          console.log(`deleted: ${writers}`)
        } else {
          // TODO return error
        }
      });
  }

  if (writers) {
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
            >
              <Grid item xs={12}>
                <Typography variant="h3">Settings</Typography>
              </Grid>
              {/* Map Name */}
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
                      value={editedMapName}
                      label="Map Name"
                      variant="outlined"
                      onChange={(e) => handleMapNameTextFieldChange(e)}
                    />
                  </Grid>
                  <Grid item>
                    <IconButton
                      aria-label="save"
                      onClick={saveMapName}
                    >
                      <SaveIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>

              {/* Map ID */}
              <Grid item xs={12}>
                <Typography variant="body1">{`Map ID: ${router.query.id}`}</Typography>
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
                  variant="outlined"
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

          {/* Delete Map Button */}
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
                  // className={classes.deleteButton}
                  startIcon={<DeleteIcon />}
                  onClick={(e) => deleteMap(e)}
                >
                  Delete Map
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Layout>
    );
  }

  return <LoadingPage />;
}

export default ElsewhereMapSettings;
