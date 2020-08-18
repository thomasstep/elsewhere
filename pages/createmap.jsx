import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import { useRouter } from 'next/router';
import Layout from '../components/layout';
import { getErrorMessage } from '../lib/form';
import { fetcher } from '../utils/fetcher';

const viewerQuery = `{
  viewer {
    email
  }
}`;

const createMapMutation = `
  mutation CreateMapMutation($name: String!) {
    createMap(name: $name)
  }
`;

function CreateMap() {
  const [newMapNameField, setNewMapNameField] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetcher(viewerQuery)
      .then(({
        viewer: {
          email: viewerEmail,
        },
      }) => {
        if (!viewerEmail) router.push('/signin');
      })
      .catch((err) => {
        console.log(err);
        router.push('/signin');
      });
  });

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
        if (createMap !== '-1') {
          router.push('/profile');
        }
      })
      .catch((error) => {
        setErrorMsg(getErrorMessage(error));
      });
  }

  return (
    <Layout session={{}}>
      <Grid
        container
        direction="column"
        justify="space-evenly"
        alignItems="flex-start"
        spacing={3}
      >
        <Grid item xs={12}>
          <Typography variant="h3">Create a new map</Typography>
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
                value={newMapNameField}
                label="New map name"
                variant="filled"
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
      </Grid>
    </Layout>
  );
}

export default CreateMap;
