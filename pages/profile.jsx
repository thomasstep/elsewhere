import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import Layout from '../components/layout';
import MapList from '../components/mapList';
import LoadingPage from '../components/loadingPage';
import { getErrorMessage } from '../lib/form';
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

const createMapMutation = `
  mutation CreateMapMutation($name: String!) {
    createMap(name: $name) {
      mapId
      mapName
      owners
      writers
      readers
    }
  }
`;

function Profile() {
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [ownedMaps, setOwnedMap] = useState([]);
  const [readableMaps, setReadableMaps] = useState([]);
  const [writableMaps, setWritableMaps] = useState([]);
  const [newMapNameField, setNewMapNameField] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

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
        if (!viewerEmail) router.push('/signin');

        setId(viewerId);
        setEmail(viewerEmail);
        setOwnedMap(viewerOwnedMaps);
        setReadableMaps(viewerReadableMaps);
        setWritableMaps(viewerWritableMaps);
      })
      .catch((err) => {
        router.push('/signin');
      });
  }, []);

  function handleNewMapNameFieldChange(event) {
    event.preventDefault();
    setNewMapNameField(event.target.value);
  }

  async function addNewMap(event) {
    event.preventDefault();
    const vars = {
      name: newMapNameField,
    };

    fetcher(createMapMutation, vars)
      .then(({ createMap }) => {
        setOwnedMap([...ownedMaps, createMap.mapId]);
      })
      .catch((error) => {
        setErrorMsg(getErrorMessage(error));
      });
  }

  if (id) {
    const sharedMaps = [...writableMaps, ...readableMaps];
    return (
      <Layout session={email}>
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
                <Typography variant="h5">Create a new map</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="filled-basic"
                  value={newMapNameField}
                  label="New map name"
                  variant="outlined"
                  onChange={(e) => handleNewMapNameFieldChange(e)}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={(e) => addNewMap(e)}
                >
                  Add New Map
                </Button>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
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

export default Profile;
