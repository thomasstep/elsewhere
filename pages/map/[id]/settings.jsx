import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { getSession } from 'next-auth/client';
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
  const [mapId] = useState(router.query.id);
  const [mapName, setMapName] = useState('');
  const [mapNameEditMode, setMapNameEditMode] = useState(false);
  const [editedMapName, setEditedMapName] = useState('');
  const [writers, setWriters] = useState(null);
  const [travelPartnerTextField, setTravelPartnerTextField] = useState('');
  const { session } = props;
  const classes = useStyles(props);

  useEffect(() => {
    if (!session) router.push('/signin');

    fetcher(getMapQuery, { mapId: router.query.id }).then(({
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
    });
  }, []);

  async function toggleMapNameEditMode() {
    if (mapNameEditMode) {
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

    setMapNameEditMode(!mapNameEditMode);
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
      queryMapId,
      writers: {
        pull: email,
      },
    };

    const {
      updateMap: {
        writers: success,
      },
    } = await fetcher(removeTravelPartnerMutation, { map: updates });
    if (!success) return;

    // Remove writer from list if the API call was successful
    const index = writers.indexOf(email);
    if (index > -1) {
      writers.splice(index, 1);
    }

    // setWriters(writers); Do I need to do this?
  }

  if (writers) {
    return (
      <Layout session={session}>
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
              <Grid item xs={12}>
                <Grid
                  container
                  direction="row"
                  justify="center"
                  alignItems="center"
                  spacing={2}
                >
                  {
                    mapNameEditMode ? (
                      <>
                        <Grid item>
                          <TextField
                            id="filled-basic"
                            value={editedMapName}
                            label="Map Name"
                            variant="filled"
                            onChange={(e) => handleMapNameTextFieldChange(e)}
                          />
                        </Grid>
                        <Grid item>
                          <IconButton
                            aria-label="save"
                            onClick={toggleMapNameEditMode}
                          >
                            <SaveIcon />
                          </IconButton>
                        </Grid>
                      </>
                    )
                      : (
                        <>
                          <Grid item>
                            <Typography variant="h3">{mapName}</Typography>
                          </Grid>
                          <Grid item>
                            <IconButton
                              aria-label="edit"
                              onClick={toggleMapNameEditMode}
                            >
                              <EditIcon />
                            </IconButton>
                          </Grid>
                        </>
                      )
                  }
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">{`Map ID: ${router.query.id}`}</Typography>
              </Grid>
            </Grid>
          </Grid>

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
                  variant="filled"
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

ElsewhereMapSettings.getInitialProps = async (context) => ({
  session: await getSession(context),
});

ElsewhereMapSettings.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  session: PropTypes.object.isRequired,
};

export default ElsewhereMapSettings;
