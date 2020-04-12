import { Map, GoogleApiWrapper } from 'google-maps-react';


export class ElsewhereMap extends React.Component {
  render() {
    return (
      <Map google={this.props.google} zoom={14}>
 
        {/* <Marker onClick={this.onMarkerClick}
                name={'Current location'} />
 
        <InfoWindow onClose={this.onInfoWindowClose}>
            <div>
              <h1>{this.state.selectedPlace.name}</h1>
            </div>
        </InfoWindow> */}
      </Map>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: process.env.GOOGLE_MAPS_KEY
})(ElsewhereMap);
