import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import SettingsIcon from '@material-ui/icons/Settings';
import { fetcher } from '../utils/fetcher';

// eslint-disable-next-line react/prefer-stateless-function
class TravelPartnerList extends React.Component {
  render() {
    const {
      partners,
    } = this.props;

    return (
      <List component="nav">
        {partners.map((email) => (
          <React.Fragment key={email}>
            <ListItem button>
              <ListItemText primary={email} />
              {/* <Link href="/map/[id]/settings" as={`/map/${mapId}/settings`}>
                <SettingsIcon />
              </Link> */}
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
};

export default TravelPartnerList;
