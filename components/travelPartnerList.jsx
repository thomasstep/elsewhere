import React from 'react';
import PropTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
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
