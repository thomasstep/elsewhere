import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
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
  const { google } = props;

  useEffect(() => {
    fetcher(getMarkers(router.query.id)).then(({
      getMarkers: mapMarkers,
    }) => {
      setMarkers(mapMarkers);
    });
  }, []);

  function onInfoWindowClose() {
    setActiveMarker({});
    setActiveInfoWindow(false);
  }

  function onMapClick(mapProps, map, clickEvent) {
    const marker = {
      lat: clickEvent.latLng.lat(),
      lng: clickEvent.latLng.lng(),
    };

    fetcher(createMarkers(router.query.id, [marker])).then(({ createMarkers: success }) => {
      if (success) {
        setActiveMarker({});
        setActiveInfoWindow(false);
        setMarkers([...markers, marker]);
      } else {
        setActiveMarker({});
        setActiveInfoWindow(false);
      }
    });
  }

  function deleteMarker() {
    const marker = {
      lat: activeMarker.position.lat(),
      lng: activeMarker.position.lng(),
    };
    console.log('FUCK FACE')

    fetcher(deleteMarkers(router.query.id, [marker])).then(({ deleteMarkers: success }) => {
      if (success) {
        fetcher(getMarkers(router.query.id)).then(({
          getMarkers: mapMarkers,
        }) => {
          console.log('HEY')
          console.log(mapMarkers)
          setActiveInfoWindow(false);
          setActiveMarker({});
          setMarkers(mapMarkers);
        });
      } else {
        setActiveMarker({});
        setActiveInfoWindow(false);
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

ElsewhereMap.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  google: PropTypes.object.isRequired,
};


export default GoogleApiWrapper({
  apiKey: process.env.GOOGLE_MAPS_KEY,
})(ElsewhereMap);
