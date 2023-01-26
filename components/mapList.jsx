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
