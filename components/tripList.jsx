import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import SettingsIcon from '@mui/icons-material/Settings';

function TripList({ trips }) {
  return (
    <List component="nav">
      {trips.map(({ id, name }) => (
        <ListItem
          key={id}
          secondaryAction={(
            <Link href={`/trip/${id}/settings`}>
              <IconButton>
                <SettingsIcon />
              </IconButton>
            </Link>
          )}
          disablePadding
        >
          <ListItemButton
            component={Link}
            href={`/trip/${id}`}
          >
            <ListItemText
              primary={name}
            />
          </ListItemButton>
          <Divider />
        </ListItem>
      ))}
    </List>
  );
}

TripList.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  trips: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default TripList;
