import { useRouter } from 'next/router';
import Box from '@material-ui/core/Box';
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';
import axios from 'axios';

import Layout from '../../components/layout';

// export async function getServerSideProps(context) {
//   const markers = await axios.post('http://localhost:3000/api/graphql', {
//     query: `{  
//       getMarkers(id: ${context.params.id}) {
//         markers {
//           lat
//           lng
//         }
//       }
//     }`
//   });
//   const json = markers.json();
//   console.log(json)
//   return {
//     props: {
//       markers,
//     }
//   };
// }


export class ElsewhereMap extends React.Component {
  // constructor(props) {
  //   super(props);
  //   // this.state = {markers: getMarkers(props.params.id)};  
  // }

  render() {
    return (
      <Layout>
        <Box>
          <Map google={this.props.google} zoom={14}>

            {this.props.markers.map((marker) => 
              <Marker
                position={marker}
              />
            )}
    
          </Map>
        </Box>
      </Layout>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: process.env.GOOGLE_MAPS_KEY
})(ElsewhereMap);
