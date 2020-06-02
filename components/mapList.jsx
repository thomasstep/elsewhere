import React from 'react';
import PropTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Link from 'next/link';

export default function MapList(props) {
  const {
    mapList,
  } = props;
  return (
    <List component="nav">
      {mapList.map((mapId) => (
        <React.Fragment key={mapId}>
          <ListItem button>
            <Link href="/map/[id]" as={`/map/${mapId}`}>
              <ListItemText primary={mapId} />
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
