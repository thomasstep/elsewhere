import Box from '@material-ui/core/Box';
import { Map, GoogleApiWrapper, Marker, InfoWindow } from 'google-maps-react';
import useSWR from 'swr'
import { request } from 'graphql-request';

import Layout from '../../components/layout';

const fetcher = (query) => request('/api/graphql', query);

function ElsewhereMap(props) {
  const { data, error } = useSWR(
    `{
      getMarkers(map: 1) {
        lat
        lng
      }
    }`,
    fetcher,
  );

  return (
    <Layout>
      <Box>
        <Map google={props.google} zoom={14}>

          {data ? data.getMarkers.map((marker) =>
            <Marker
              position={marker}
              key={marker.lat.toString().concat(marker.lng.toString())}
            />
          ) : null}
   
        </Map>
      </Box>
    </Layout>
  );
}

export default GoogleApiWrapper({
  apiKey: process.env.GOOGLE_MAPS_KEY
})(ElsewhereMap);
