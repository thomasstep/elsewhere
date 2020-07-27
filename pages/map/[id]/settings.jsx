import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { getSession } from 'next-auth/client';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
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
    backgroundColor: theme.palette.error.main,
    '&:hover': {
      backgroundColor: theme.palette.error.main,
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
    owners
    writers
    readers
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
  const [writers, setWriters] = useState(null);
  const [travelPartnerTextField, setTravelPartnerTextField] = useState('');
  const { session } = props;
  const classes = useStyles(props);

  useEffect(() => {
    if (!session) router.push('/signin');

    fetcher(getMapQuery, { mapId: router.query.id }).then(({
      getMap: {
        // owners,
        writers: mapWriters,
        // readers,
      },
    }) => {
      setWriters(mapWriters);
    });
  }, []);

  async function deleteMap(event) {
    event.preventDefault();

    const { deleteMap: success } = await fetcher(deleteMapMutation, { mapId });
    if (!success) return;

    router.push('/profile');
  }

  function handleTravelBuddyTextFieldChange(event) {
    setTravelPartnerTextField(event.target.value);
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
      <Layout session>
        <Typography variant="h3">Settings</Typography>
        <Typography variant="h5">{`Map ID: ${router.query.id}`}</Typography>
        <Button
          variant="contained"
          className={classes.deleteButton}
          startIcon={<DeleteIcon />}
          onClick={(e) => deleteMap(e)}
        >
          Delete Map
        </Button>
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
        <TextField
          id="filled-basic"
          value={travelPartnerTextField}
          label="Email"
          variant="filled"
          onChange={(e) => handleTravelBuddyTextFieldChange(e)}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={(e) => addTravelPartner(e)}
        >
          Add Travel Partner
        </Button>
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
