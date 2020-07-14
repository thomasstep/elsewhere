import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { getSession } from 'next-auth/client';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import React, { useState, useEffect } from 'react';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';
import { fetcher } from '../../utils/fetcher';
import Layout from '../../components/layout';
import ElsewhereInfoWindow from '../../components/infowindow';

const getMarkers = (id) => `{
  getMarkers(mapId: "${id}") {
    lat
    lng
  }
}`;

const createMarkers = (id, markers) => {
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
    createMarkers(mapId: "${id}", markers: ${markersString})
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
    deleteMarkers(mapId: "${id}", markers: ${markersString})
  }`;
};

function ElsewhereMap(props) {
  const router = useRouter();
  const [activeMarker, setActiveMarker] = useState({});
  const [activeInfoWindow, setActiveInfoWindow] = useState(false);
  const [markers, setMarkers] = useState([]);
  const { google, session } = props;

  useEffect(() => {
    if (!session) router.push('/api/auth/signin');

    fetcher(getMarkers(router.query.id)).then(({
      getMarkers: mapMarkers,
    }) => {
      setMarkers(mapMarkers);
    });
  }, []);

  function onInfoWindowClose() {
    setActiveInfoWindow(false);
    setActiveMarker({});
  }

  function onMapClick(mapProps, map, clickEvent) {
    if (activeInfoWindow) {
      setActiveInfoWindow(false);
      setActiveMarker({});
      return;
    }

    const marker = {
      lat: clickEvent.latLng.lat(),
      lng: clickEvent.latLng.lng(),
    };

    fetcher(createMarkers(router.query.id, [marker])).then(({ createMarkers: success }) => {
      if (success) {
        setActiveInfoWindow(false);
        setActiveMarker({});
        setMarkers([...markers, marker]);
      } else {
        setActiveInfoWindow(false);
        setActiveMarker({});
      }
    });
  }

  function deleteMarker() {
    const marker = {
      lat: activeMarker.position.lat(),
      lng: activeMarker.position.lng(),
    };

    fetcher(deleteMarkers(router.query.id, [marker])).then(({ deleteMarkers: success }) => {
      if (success) {
        fetcher(getMarkers(router.query.id)).then(({
          getMarkers: mapMarkers,
        }) => {
          setActiveInfoWindow(false);
          setActiveMarker({});
          setMarkers(mapMarkers);
        });
      } else {
        setActiveInfoWindow(false);
        setActiveMarker({});
      }
    });
  }

  return (
    <Layout mapPage>
      <Box>
        <Map
          google={google}
          zoom={14}
          onClick={onMapClick}
        >

          {markers.length ? markers.map((marker) => (
            <Marker
              position={marker}
              onClick={(smth, clickedMarker) => {
                setActiveMarker(clickedMarker);
                setActiveInfoWindow(true);
              }}
              key={marker.lat.toString().concat(marker.lng.toString())}
            />
          )) : null}

          <ElsewhereInfoWindow
            visible={activeInfoWindow}
            marker={activeMarker}
            onClose={onInfoWindowClose}
          >
            <div>
              <p>I&apos;m here</p>
              <Button onClick={deleteMarker}>
                Delete this marker
              </Button>
            </div>
          </ElsewhereInfoWindow>

        </Map>
      </Box>
    </Layout>
  );
}

ElsewhereMap.getInitialProps = async (context) => ({
  session: await getSession(context),
});

ElsewhereMap.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  google: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  session: PropTypes.object.isRequired,
};

export default GoogleApiWrapper({
  apiKey: process.env.GOOGLE_MAPS_KEY,
})(ElsewhereMap);
