import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';

import { getMarkers } from '../../utils/db';

export async function getServerSideProps(context) {
  const markers = getMarkers(context.params.id);
  return {
    props: {
      markers,
    },
  }
}


export class ElsewhereMap extends React.Component {
  
  render() {
    return (
      <Map google={this.props.google} zoom={14}>

        {this.props.markers.map((marker) => 
          <Marker
            name={'Current location'}
            position={marker}
          />
        )}
 
      </Map>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: process.env.GOOGLE_MAPS_KEY
})(ElsewhereMap);
