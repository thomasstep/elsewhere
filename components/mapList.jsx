import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import SettingsIcon from '@mui/icons-material/Settings';

function MapList({ maps }) {
  return (
    <List component="nav">
      {maps.map(({ id, name }) => (
        <React.Fragment key={id}>
          <ListItem button>
            <Link href="/trip/[id]" as={`/trip/${id}`}>
              <ListItemText primary={name} />
            </Link>
            <Link href="/trip/[id]/settings" as={`/trip/${id}/settings`}>
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
  maps: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default MapList;
