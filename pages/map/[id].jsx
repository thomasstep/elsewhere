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

const getMarkers = `query getMarkers (
    $mapId: ID!
  ) {
  getMarkers(mapId: $mapId) {
    lat
    lng
  }
}`;

const createMarkers = `mutation createMarkers(
  $mapId: ID!
  $markers: [MarkerInput]!
) {
  createMarkers(mapId: $mapId, markers: $markers)
}`;

const deleteMarkers = `mutation deleteMarkers(
  $mapId: ID!
  $markers: [MarkerInput]!
) {
  deleteMarkers(mapId: $mapId, markers: $markers)
}`;

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
  const classes = useStyles(props);

  useEffect(() => {
    getSession().then((session) => {
      if (!session) router.push('/signin');
    });

    fetcher(getMarkers, { mapId: router.query.id }).then(({
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
    const marker = {
      lat: clickEvent.latLng.lat(),
      lng: clickEvent.latLng.lng(),
    };

    const variables = {
      mapId: router.query.id,
      markers: [
        marker,
      ],
    };

    fetcher(createMarkers, variables).then(({ createMarkers: success }) => {
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

  function createMarker() {
    const variables = {
      mapId: router.query.id,
      markers: [
        {
          lat: activeMarker.lat,
          lng: activeMarker.lng,
        },
      ],
    };

    fetcher(createMarkers, variables).then(({ createMarkers: success }) => {
      if (success) {
        setActiveInfoWindow(false);
        setActiveMarker({});
        setMarkers([...markers, activeMarker]);
      } else {
        setActiveInfoWindow(false);
        setActiveMarker({});
      }
    });
  }

  function deleteMarker() {
    const variables = {
      mapId: router.query.id,
      markers: [
        activeMarker,
      ],
    };

    fetcher(deleteMarkers, variables).then(({ deleteMarkers: success }) => {
      if (success) {
        fetcher(getMarkers, { mapId: router.query.id }).then(({
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
        const searchMarker = {
          ...coordinates,
          notSaved: true,
        };
        setMarkers([...markers, searchMarker]);
        setActiveMarker(searchMarker);
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
                onClick={() => {
                  setActiveMarker(marker);
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
                {activeMarker.notSaved ? (
                  <Button onClick={createMarker}>
                    Save
                  </Button>
                )
                  : (
                    <Button onClick={deleteMarker}>
                      Delete
                    </Button>
                  )}
              </div>
            </Drawer>

          </Map>
        </Box>
      </Layout>
    );
  }

  return <LoadingPage />;
}

ElsewhereMap.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  google: PropTypes.object.isRequired,
};

export default GoogleApiWrapper({
  apiKey: process.env.GOOGLE_MAPS_KEY,
})(ElsewhereMap);
