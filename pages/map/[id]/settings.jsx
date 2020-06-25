import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';

import { fetcher } from '../../../utils/fetcher';
import Layout from '../../../components/layout';
import TravelPartnerList from '../../../components/travelPartnerList';

const styles = (theme) => ({
  deleteButton: {
    backgroundColor: theme.palette.error.main,
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


class ElsewhereMapSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mapId: props.router.query.id,
      map: {
        owners: [],
        writers: [],
        readers: [],
      },
    };

    this.deleteMap = this.deleteMap.bind(this);
    this.addTravelPartner = this.addTravelPartner.bind(this);
  }

  componentDidMount() {
    const { router } = this.props;
    fetcher(getMapQuery, { mapId: router.query.id }).then(({ getMap: map }) => {
      this.setState({
        map,
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

  async addTravelPartner(event) {
    event.preventDefault();
    const { mapId } = this.state;
    const updates = {
      mapId,
      writers: {
        push: 'person',
      },
    };

    const {
      updateMap: {
        writers: success,
      },
    } = await fetcher(addTravelPartnerMutation, { map: updates });
    if (!success) return;

    this.componentDidMount();
  }


  render() {
    const {
      map: {
        writers,
        readers, // This should always be an empty array until read and write is created
      },
    } = this.state;

    const { router, classes } = this.props;

    const travelPartners = [...writers, ...readers];

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
              <TravelPartnerList partners={travelPartners} />
            </>
          )
            : (
              null
            )
        }
        <TextField id="filled-basic" label="Email" variant="filled" />
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
