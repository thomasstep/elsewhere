import { withRouter } from 'next/router'
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';
import { request } from 'graphql-request';

import Layout from '../../components/layout';

const fetcher = async (query) => {
  const res = await request('/api/graphql', query)
  return res;
};
const getMarkers = (id) => `{
  getMarkers(map: ${id}) {
    lat
    lng
  }
}`;

const upsertMarkers = (id, markers) => {
  let markersString = `[`;
  markers.forEach((marker) => {
    markersString += `
    {
      lat: ${marker.lat}
      lng: ${marker.lng}
    }`;
  });
  markersString += `]`
  console.log(markersString)
  return `mutation {
    upsertMarkers(map: ${id}, markers: ${markersString})
  }`;
}

class ElsewhereMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeMarker: {},
      activeInfoWindow: false,
      markers: [],
    };
  }

  componentDidMount() {
    fetcher(getMarkers(this.props.router.query.id)).then(({ getMarkers: markers }) => {
      this.setState({
        markers,
      });
    });
  }

  deleteMarker() {
    console.log('Delete marker called.')
  }

  onInfoWindowClose() {
    this.setState({
      activeInfoWindow: false,
      activeMarker: {}
    });
  }

  onMapClick(mapProps, map, clickEvent) {
    const marker = {
      lat: clickEvent.latLng.lat(),
      lng: clickEvent.latLng.lng()
    };

    fetcher(upsertMarkers(this.props.router.query.id, [marker])).then(({ upsertMarkers: success }) => {
      if(success) {
        console.log('Marker upserted.')
        this.setState({
          activeInfoWindow: false,
          activeMarker: {},
          markers: [...this.state.markers, marker],
        });
      } else {
        console.error('Problem upserting marker.')
        this.setState({
          activeInfoWindow: false,
          activeMarker: {},
        });
      }
    });
  }

  render() {
    return (
      <Layout>
        <Box>
          <Map
            google={this.props.google}
            zoom={14}
            onClick={this.onMapClick.bind(this)}
          >

            {this.state.markers.length ? this.state.markers.map((marker) =>
              <Marker
                position={marker}
                onClick={(props, marker) => {
                    this.setState({
                      activeInfoWindow: true,
                      activeMarker: marker,
                    });
                  }
                }
                key={marker.lat.toString().concat(marker.lng.toString())}
              />
            ) : null}

            <InfoWindow
              visible={this.state.activeInfoWindow}
              marker={this.state.activeMarker}
              onClose={this.onInfoWindowClose.bind(this)}
              >
                <div>
                  I'm here
                </div>
            </InfoWindow>
    
          </Map>
        </Box>
      </Layout>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: process.env.GOOGLE_MAPS_KEY
})(withRouter(ElsewhereMap));
