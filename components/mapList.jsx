import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import SettingsIcon from '@material-ui/icons/Settings';

function MapList({ maps }) {

  return (
    <List component="nav">
      {maps.map(({ id, name }) => (
        <React.Fragment key={id}>
          <ListItem button>
            <Link href="/map/[id]" as={`/map/${id}`}>
              <ListItemText primary={name} />
            </Link>
            <Link href="/map/[id]/settings" as={`/map/${id}/settings`}>
              <SettingsIcon />
            </Link>
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  );
}

MapList.propTypes = {
  mapList: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default MapList;
