import React from 'react';
import PropTypes from 'prop-types';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetcher } from '../utils/fetcher';

const removeTravelPartnerMutation = `mutation removeTravelPartner(
  $map: MapUpdateInput!
) {
  updateMap(updates: $map) {
    writers
  }
}`;

// eslint-disable-next-line react/prefer-stateless-function
class TravelPartnerList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      partners: props.partners,
    };

    this.removeTravelPartner = this.removeTravelPartner.bind(this);
  }

  async removeTravelPartner(event, email) {
    event.preventDefault();
    const {
      partners,
    } = this.state;
    const {
      mapId,
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

    // Remove partner from list if the API call was successful
    const index = partners.indexOf(email);
    if (index > -1) {
      partners.splice(index, 1);
    }

    this.setState({
      partners,
    });
  }

  render() {
    const {
      partners,
    } = this.state;

    return (
      <List component="nav">
        {partners.map((email) => (
          <React.Fragment key={email}>
            <ListItem button>
              <ListItemText primary={email} />
              <IconButton aria-label="delete" onClick={(e) => this.removeTravelPartner(e, email)}>
                <DeleteIcon />
              </IconButton>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    );
  }
}

TravelPartnerList.propTypes = {
  partners: PropTypes.arrayOf(PropTypes.string).isRequired,
  mapId: PropTypes.string.isRequired,
};

export default TravelPartnerList;
