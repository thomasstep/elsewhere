import Box from '@material-ui/core/Box';
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';
import useSWR from 'swr'
import { request } from 'graphql-request';

import Layout from '../../components/layout';

const fetcher = async (query) => {
  const res = await request('/api/graphql', query)
  return res;
};
const getMarkers = `{
  getMarkers(map: 1) {
    lat
    lng
  }
}`;

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
    fetcher(getMarkers).then(({ getMarkers: markers }) => {
      this.setState({
        markers,
      });
    });
  }

  render() {
    return (
      <Layout>
        <Box>
          <Map google={this.props.google} zoom={14}>

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
              >
                <div>
                  I am here
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
})(ElsewhereMap);
