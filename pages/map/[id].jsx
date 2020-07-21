import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { getSession } from 'next-auth/client';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Drawer from '@material-ui/core/Drawer';
import React, { useState, useEffect } from 'react';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';
import { fetcher } from '../../utils/fetcher';
import Layout from '../../components/layout';
import LoadingPage from '../../components/loadingPage';

const useStyles = makeStyles((theme) => ({
  searchBox: {
    margin: 0,
    left: 10,
    top: '80%',
    position: 'fixed',
    zIndex: theme.zIndex.appBar,
  },
  searchTextField: {
    backgroundColor: 'white',
  },
  searchButton: {
    backgroundColor: 'white',
  },
}));

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

const getPlace = `query getPlace(
  $query: String!
  $locationBias: LocationBiasInput
) {
  getPlace(query: $query, locationBias: $locationBias) {
    lat
    lng
  }
}`;

function ElsewhereMap(props) {
  const router = useRouter();
  const [activeMarker, setActiveMarker] = useState({});
  const [activeInfoWindow, setActiveInfoWindow] = useState(false);
  const [markers, setMarkers] = useState(null);
  const [searchFieldText, setSearchFieldText] = useState('');
  const [mapCenterLat, setMapCenterLat] = useState(0); // TODO use map's initial center
  const [mapCenterLng, setMapCenterLng] = useState(0);
  const { google } = props;
  // const { session } = props;
  const classes = useStyles(props);

  useEffect(() => {
    // TODO fix this
    // if (!session) router.push('/api/auth/signin');

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

  function changeMapCenter(mapProps, map) {
    setMapCenterLat(map.center.lat());
    setMapCenterLng(map.center.lng());
  }

  function deleteMarker() {
    fetcher(deleteMarkers(router.query.id, [activeMarker])).then(({ deleteMarkers: success }) => {
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

  function handleSearchFieldTextChange(event) {
    setSearchFieldText(event.target.value);
  }

  function searchForPlace() {
    const query = searchFieldText;
    const locationBias = {
      point: {
        lat: mapCenterLat,
        lng: mapCenterLng,
      },
    };

    fetcher(getPlace, { query, locationBias })
      .then(({ getPlace: places }) => {
        const [coordinates] = places;
        setMarkers([...markers, coordinates]);
        setActiveMarker(coordinates);
        setActiveInfoWindow(true);
      });
  }

  if (markers) {
    return (
      <Layout mapPage>
        <Box
          className={classes.searchBox}
        >

          <TextField
            id="outlined-basic"
            value={searchFieldText}
            label="Search for a place"
            variant="outlined"
            onChange={(e) => handleSearchFieldTextChange(e)}
            className={classes.searchTextField}
          />

          <Button
            variant="contained"
            onClick={(e) => searchForPlace(e)}
            className={classes.searchButton}
          >
            Search
          </Button>

        </Box>
        <Box>
          <Map
            google={google}
            zoom={14}
            onClick={onMapClick}
            onRecenter={changeMapCenter}
          >

            {markers.length ? markers.map((marker) => (
              <Marker
                position={marker}
                onClick={(smth, clickedMarker) => {
                  setActiveMarker({
                    lat: clickedMarker.position.lat(),
                    lng: clickedMarker.position.lng(),
                  });
                  setActiveInfoWindow(true);
                }}
                key={marker.lat.toString().concat(marker.lng.toString())}
              />
            )) : null}

            <Drawer
              anchor="right"
              open={activeInfoWindow}
              onClose={onInfoWindowClose}
            >
              <div>
                Latitude:
                {activeMarker.lat}
                <br />
                Longitude:
                {activeMarker.lng}
                <br />
                <Button onClick={deleteMarker}>
                  Delete
                </Button>
              </div>
            </Drawer>

          </Map>
        </Box>
      </Layout>
    );
  }

  return <LoadingPage />;
}

ElsewhereMap.getInitialProps = async (context) => ({
  session: await getSession(context),
});

ElsewhereMap.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  google: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  // session: PropTypes.object.isRequired,
};

export default GoogleApiWrapper({
  apiKey: process.env.GOOGLE_MAPS_KEY,
})(ElsewhereMap);
