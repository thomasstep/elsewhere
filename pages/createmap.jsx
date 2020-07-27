import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/client';
import Layout from '../components/layout';
import { getErrorMessage } from '../lib/form';
import { fetcher } from '../utils/fetcher';

const createMapMutation = `
  mutation CreateMapMutation($name: String!) {
    createMap(name: $name)
  }
`;

function CreateMap({ session }) {
  const [newMapNameField, setNewMapNameField] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!session) router.push('/signin');
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
    <Layout session={session}>
      <Typography variant="h3">Create a new map</Typography>
      <TextField
        id="filled-basic"
        value={newMapNameField}
        label="New map name"
        variant="filled"
        onChange={(e) => handleNewMapNameFieldChange(e)}
      />
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={(e) => addNewMap(e)}
      >
        Add New Map
      </Button>
    </Layout>
  );
}

CreateMap.getInitialProps = async (context) => ({
  session: await getSession(context),
});

CreateMap.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  session: PropTypes.object.isRequired,
};

export default CreateMap;
