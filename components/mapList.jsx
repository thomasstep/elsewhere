import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import SettingsIcon from '@mui/icons-material/Settings';

function MapList({ maps }) {
  return (
    <List component="nav">
      {maps.map(({ id, name }) => (
        <React.Fragment key={id}>
          <ListItemButton
            component={Link}
            href={`/trip/${id}`}
          >
            <ListItemText primary={name} />
            <Link href={`/trip/${id}/settings`}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
            </Link>
          </ListItemButton>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  );
}

MapList.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  maps: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default MapList;
