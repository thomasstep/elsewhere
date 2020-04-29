import Box from '@material-ui/core/Box';
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';
import useSWR from 'swr'
import { request } from 'graphql-request';

import Layout from '../../components/layout';

const fetcher = (query) => request('http://localhost:3000/api/graphql', query);

function ElsewhereMap(props) {
  console.log(props)
  const { data, error } = useSWR(
    `{
      getMarkers(map: ${props.url.query.id}) {
        lat
        lng
      }
    }`,
    fetcher,
  );
  console.log('Data:')
  console.log(data)
  console.log('Error:')
  console.error(error)

  return (
    <Layout>
      <Box>
        <Map google={props.google} zoom={14}>

          {data.getMarkers.map((marker) =>
            <Marker
              position={marker}
            />
          )}
   
        </Map>
      </Box>
    </Layout>
  );
}

export default GoogleApiWrapper({
  apiKey: process.env.GOOGLE_MAPS_KEY
})(ElsewhereMap);
