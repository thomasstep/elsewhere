import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import SettingsIcon from '@material-ui/icons/Settings';
import { fetcher } from '../utils/fetcher';

const getMapNameQuery = (id) => `{
  getMap(mapId: "${id}") {
    mapId
    mapName
  }
}`;

function MapList({ mapList }) {
  const [maps, setMaps] = useState([]);

  useEffect(() => {
    const promises = [];
    mapList.forEach((mapId) => {
      promises.push(
        fetcher(getMapNameQuery(mapId))
          .then(({ getMap }) => getMap)
          .catch(() => ({
            mapId,
            mapName: 'Error retrieving map.',
          })),
      );
    });
    Promise.all(promises)
      .then((allMaps) => {
        setMaps(allMaps);
      });
  }, [mapList]);

  return (
    <List component="nav">
      {maps.map(({ mapId, mapName }) => (
        <React.Fragment key={mapId}>
          <ListItem button>
            <Link href="/map/[id]" as={`/map/${mapId}`}>
              <ListItemText primary={mapName} />
            </Link>
            <Link href="/map/[id]/settings" as={`/map/${mapId}/settings`}>
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
