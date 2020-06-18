import React from 'react';
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

class MapList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      maps: [],
    };
  }

  componentDidMount() {
    const {
      mapList,
    } = this.props;
    const promises = [];
    mapList.forEach((mapId) => {
      promises.push(
        fetcher(getMapNameQuery(mapId))
          .then(({ getMap }) => getMap),
      );
    });
    Promise.all(promises)
      .then((maps) => {
        this.setState({
          maps,
        });
      });
  }

  render() {
    const {
      maps,
    } = this.state;

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
}

MapList.propTypes = {
  mapList: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default MapList;
