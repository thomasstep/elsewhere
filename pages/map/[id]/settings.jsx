import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
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

const styles = (theme) => ({
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
});

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


class ElsewhereMapSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mapId: props.router.query.id,
      // owners: [],
      writers: [],
      // readers: [],
      travelPartnerTextField: '',
    };

    this.deleteMap = this.deleteMap.bind(this);
    this.handleTravelBuddyTextFieldChange = this.handleTravelBuddyTextFieldChange.bind(this);
    this.addTravelPartner = this.addTravelPartner.bind(this);
    this.removeTravelPartner = this.removeTravelPartner.bind(this);
  }

  componentDidMount() {
    const { router } = this.props;
    fetcher(getMapQuery, { mapId: router.query.id }).then(({
      getMap: {
        // owners,
        writers,
        // readers,
      },
    }) => {
      this.setState({
        // owners,
        writers,
        // readers,
      });
    });
  }

  async deleteMap(event) {
    event.preventDefault();
    const { mapId } = this.state;

    const { deleteMap: success } = await fetcher(deleteMapMutation, { mapId });
    if (!success) return;

    const { router } = this.props;
    router.push('/profile');
  }

  handleTravelBuddyTextFieldChange(event) {
    this.setState({
      travelPartnerTextField: event.target.value,
    });
  }

  async addTravelPartner(event) {
    event.preventDefault();
    const {
      mapId,
      writers,
      travelPartnerTextField,
    } = this.state;
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
    this.setState({
      writers,
      travelPartnerTextField: '',
    });
  }

  async removeTravelPartner(event, email) {
    event.preventDefault();
    const {
      writers,
    } = this.state;
    const {
      router: {
        query: {
          id: mapId,
        },
      },
    } = this.props;

    const updates = {
      mapId,
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

    this.setState({
      writers,
    });
  }

  render() {
    const {
      writers,
      // readers will not be used until read and write permissions are created
      // as of 30 June 2020 it's only write
      // readers,
      travelPartnerTextField,
    } = this.state;

    const { router, classes } = this.props;

    // const travelPartners = [...writers, ...readers];

    return (
      <Layout>
        <Typography variant="h3">Settings</Typography>
        <Typography variant="h5">{`Map ID: ${router.query.id}`}</Typography>
        <Button
          variant="contained"
          className={classes.deleteButton}
          startIcon={<DeleteIcon />}
          onClick={(e) => this.deleteMap(e)}
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
                        onClick={(e) => this.removeTravelPartner(e, email)}
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
          onChange={(e) => this.handleTravelBuddyTextFieldChange(e)}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={(e) => this.addTravelPartner(e)}
        >
          Add Travel Partner
        </Button>
      </Layout>
    );
  }
}

ElsewhereMapSettings.propTypes = {
  router: PropTypes.shape({
    push: PropTypes.func.isRequired,
    query: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  classes: PropTypes.shape(
    PropTypes.object,
  ).isRequired,
};

export default withStyles(styles, { withTheme: true })(withRouter(ElsewhereMapSettings));
