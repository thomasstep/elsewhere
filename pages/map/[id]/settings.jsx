import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import { fetcher } from '../../../utils/fetcher';
import Layout from '../../../components/layout';
import LoadingPage from '../../../components/loadingPage';

const useStyles = makeStyles((theme) => ({
  deleteButton: {
    color: 'white',
    backgroundColor: theme.palette.error.main,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  },
  deleteTravelPartnerButton: {
    '&:hover': {
      backgroundColor: theme.palette.error.main,
    },
  },
}));

const viewerQuery = `{
  viewer {
    email
  }
}`;

const getMapQuery = `query getMap (
  $mapId: ID!
){
  getMap(mapId: $mapId) {
    mapName
    owners
    writers
    readers
  }
}`;

// TODO consolidate all of the updateMap mutations
const updateMapMutation = `mutation updateMapName (
  $map: MapUpdateInput!
) {
  updateMap(updates: $map) {
    mapName
  }
}`;

const deleteMapMutation = `mutation deleteMap (
  $mapId: ID!
){
  deleteMap(mapId: $mapId)
}`;

const addTravelPartnerMutation = `mutation addTravelPartner (
  $map: MapUpdateInput!
) {
  updateMap(updates: $map) {
    writers
  }
}`;

const removeTravelPartnerMutation = `mutation removeTravelPartner(
  $map: MapUpdateInput!
) {
  updateMap(updates: $map) {
    writers
  }
}`;

function ElsewhereMapSettings(props) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [mapId] = useState(router.query.id);
  const [mapName, setMapName] = useState('');
  const [mapNameEditMode, setMapNameEditMode] = useState(false);
  const [editedMapName, setEditedMapName] = useState('');
  const [writers, setWriters] = useState(null);
  const [travelPartnerTextField, setTravelPartnerTextField] = useState('');
  const classes = useStyles(props);

  useEffect(() => {
    fetcher(viewerQuery)
      .then(({
        viewer: {
          email: viewerEmail,
        },
      }) => {
        if (!viewerEmail) router.push('/signin');
        setUserEmail(viewerEmail);
      })
      .catch(() => {
        router.push('/signin');
      });

    fetcher(getMapQuery, { mapId: router.query.id })
      .then(({
        getMap: {
          mapName: retrievedName,
          // owners,
          writers: mapWriters,
          // readers,
        },
      }) => {
        setWriters(mapWriters);
        setMapName(retrievedName);
        // Initialize this so it doesn't automatically change map name to ''
        setEditedMapName(retrievedName);
      })
      .catch((err) => {
        if (err.message === 'Context creation failed: Please log in.') router.push('/signin');
      });
  }, []);

  async function saveMapName() {
    if (mapName !== editedMapName) {
      const updates = {
        mapId,
        mapName: editedMapName,
      };

      const {
        updateMap: {
          mapName: success,
        },
      } = await fetcher(updateMapMutation, { map: updates });
      if (!success) return;

      setMapName(editedMapName);
      setEditedMapName(editedMapName);
    }
  }

  async function deleteMap(event) {
    event.preventDefault();

    const { deleteMap: success } = await fetcher(deleteMapMutation, { mapId });
    if (!success) return;

    router.push('/profile');
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
      mapId,
      writers: {
        push: travelPartnerTextField,
      },
    };

    const {
      updateMap: {
        writers: success,
      },
    } = await fetcher(addTravelPartnerMutation, { map: updates });
    if (!success) return;

    writers.push(travelPartnerTextField);
    // setWriters(writers); Do I need to do this?
    setTravelPartnerTextField('');
  }

  async function removeTravelPartner(event, email) {
    event.preventDefault();
    const {
      query: {
        id: queryMapId,
      },
    } = router;

    const updates = {
      mapId: queryMapId,
      writers: {
        pull: email,
      },
    };

    try {
      const {
        updateMap: {
          writers: success,
        },
      } = await fetcher(removeTravelPartnerMutation, { map: updates });
      if (!success) return;
    } catch (err) {
      if (err.message === 'Context creation failed: Please log in.') router.push('/signin');
    }
    // Remove writer from list if the API call was successful
    // Need to make a deep copy and call setWriters to get the render
    const writerUpdates = [...writers];
    const index = writerUpdates.indexOf(email);
    if (index > -1) {
      writerUpdates.splice(index, 1);
    }

    setWriters(writerUpdates);
  }

  if (writers) {
    return (
      <Layout session={userEmail}>
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
            writers.length ? (
              <>
                <Typography variant="h5">Travel Partners</Typography>
                <List component="nav">
                  {writers.map((email) => (
                    <React.Fragment key={email}>
                      <ListItem button>
                        <ListItemText primary={email} />
                        <IconButton
                          aria-label="delete"
                          className={classes.deleteTravelPartnerButton}
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
                  className={classes.deleteButton}
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
