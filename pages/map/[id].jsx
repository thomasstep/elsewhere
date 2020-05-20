import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import React from 'react';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';

import { fetcher } from '../../utils/fetcher';
import Layout from '../../components/layout';
import ElsewhereInfoWindow from '../../components/infowindow';

const getMarkers = (id) => `{
  getMarkers(map: ${id}) {
    lat
    lng
  }
}`;

const upsertMarkers = (id, markers) => {
  let markersString = '[';
  markers.forEach((marker) => {
    markersString += `
    {
      lat: ${marker.lat}
      lng: ${marker.lng}
    }`;
  });
  markersString += ']';
  return `mutation {
    upsertMarkers(map: ${id}, markers: ${markersString})
  }`;
};

const deleteMarkers = (id, markers) => {
  let markersString = '[';
  markers.forEach((marker) => {
    markersString += `
    {
      lat: ${marker.lat}
      lng: ${marker.lng}
    }`;
  });
  markersString += ']';
  return `mutation {
    deleteMarkers(map: ${id}, markers: ${markersString})
  }`;
};

class ElsewhereMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeMarker: {},
      activeInfoWindow: false,
      markers: [],
    };

    this.onMapClick = this.onMapClick.bind(this);
    this.onInfoWindowClose = this.onInfoWindowClose.bind(this);
    this.deleteMarker = this.deleteMarker.bind(this);
  }

  componentDidMount() {
    const { router } = this.props;
    fetcher(getMarkers(router.query.id)).then(({ getMarkers: markers }) => {
      this.setState({
        markers,
      });
    });
  }

  onInfoWindowClose() {
    this.setState({
      activeInfoWindow: false,
      activeMarker: {},
    });
  }

  onMapClick(mapProps, map, clickEvent) {
    const { router } = this.props;
    const { markers } = this.state;

    const marker = {
      lat: clickEvent.latLng.lat(),
      lng: clickEvent.latLng.lng(),
    };


    fetcher(upsertMarkers(router.query.id, [marker])).then(({ upsertMarkers: success }) => {
      if (success) {
        this.setState({
          activeInfoWindow: false,
          activeMarker: {},
          markers: [...markers, marker],
        });
      } else {
        this.setState({
          activeInfoWindow: false,
          activeMarker: {},
        });
      }
    });
  }

  deleteMarker() {
    const { router } = this.props;
    const { activeMarker } = this.state;

    const marker = {
      lat: activeMarker.position.lat(),
      lng: activeMarker.position.lng(),
    };

    fetcher(deleteMarkers(router.query.id, [marker])).then(({ deleteMarkers: success }) => {
      if (success) {
        fetcher(getMarkers(router.query.id)).then(({ getMarkers: markers }) => {
          this.setState({
            activeInfoWindow: false,
            activeMarker: {},
            markers,
          });
        });
      } else {
        this.setState({
          activeInfoWindow: false,
          activeMarker: {},
        });
      }
    });
  }

  render() {
    const { google } = this.props;
    const { markers, activeInfoWindow, activeMarker } = this.state;

    return (
      <Layout>
        <Box>
          <Map
            google={google}
            zoom={14}
            onClick={this.onMapClick}
          >

            {markers.length ? markers.map((marker) => (
              <Marker
                position={marker}
                onClick={(props, clickedMarker) => {
                  this.setState({
                    activeInfoWindow: true,
                    activeMarker: clickedMarker,
                  });
                }}
                key={marker.lat.toString().concat(marker.lng.toString())}
              />
            )) : null}

            <ElsewhereInfoWindow
              visible={activeInfoWindow}
              marker={activeMarker}
              onClose={this.onInfoWindowClose}
            >
              <div>
                <p>I&apos;m here</p>
                <Button onClick={this.deleteMarker}>
                  Delete this marker
                </Button>
              </div>
            </ElsewhereInfoWindow>

          </Map>
        </Box>
      </Layout>
    );
  }
}

ElsewhereMap.propTypes = {
  router: PropTypes.shape({
    push: PropTypes.func.isRequired,
    query: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  google: PropTypes.object.isRequired,
};

export default GoogleApiWrapper({
  apiKey: process.env.GOOGLE_MAPS_KEY,
})(withRouter(ElsewhereMap));
