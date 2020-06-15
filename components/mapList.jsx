import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import { fetcher } from '../utils/fetcher';

const getMapNameQuery = (id) => `{
  getMap(mapId: "${id}") {
    mapId
    mapName
  }
}`;

const deleteMapMutation = `mutation deleteMap (
  $mapId: ID!
){
  deleteMap(mapId: $mapId)
}`;

// TODO get maps, write name of map instead of ID
class MapList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      maps: [],
    };

    this.deleteMap = this.deleteMap.bind(this);
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

  async deleteMap(event, mapId) {
    event.preventDefault();
    const { deleteMap: success } = await fetcher(deleteMapMutation, { mapId });
    if (!success) return;

    const { maps } = this.state;
    const index = maps.findIndex((map) => map.mapId === mapId);
    if (index > -1) {
      maps.splice(index, 1);
      this.setState({
        maps,
      });
    }
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
              <IconButton onClick={(event) => this.deleteMap(event, mapId)} edge="start" aria-label="menu">
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

MapList.propTypes = {
  mapList: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default MapList;
