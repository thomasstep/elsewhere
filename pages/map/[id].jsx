import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { getSession } from 'next-auth/client';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Card from '@material-ui/core/Card';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Drawer from '@material-ui/core/Drawer';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import React, { useState, useEffect } from 'react';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';
import { fetcher } from '../../utils/fetcher';
import Layout from '../../components/layout';

const useStyles = makeStyles((theme) => ({
  searchBox: {
    margin: 0,
    left: 10,
    bottom: '5%',
    position: 'fixed',
    zIndex: theme.zIndex.appBar,
  },
  searchTextField: {
    backgroundColor: 'white',
  },
  searchButton: {
    color: 'white',
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  deleteButton: {
    color: 'white',
    backgroundColor: theme.palette.error.main,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  },
  saveButton: {
    color: 'white',
    backgroundColor: theme.palette.success.main,
    '&:hover': {
      backgroundColor: theme.palette.success.dark,
    },
  },
  infoWindowPaper: {},
  infoWindowGrid: {
    // margin: 20,
    position: 'fixed',
    minHeight: '100vh',
    zIndex: theme.zIndex.appBar + 1,
  },
  infoWindowDrawer: {},
  infoWindowDrawerPaper: {
    width: '80%',
    padding: theme.spacing(3),
  },
}));

const getMarkers = `query getMarkers (
    $mapId: ID!
  ) {
  getMarkers(mapId: $mapId) {
    coordinates {
      lat
      lng
    }
    name
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

const nearbyPlaces = `query nearbySearch(
  $location: LatLngInput!
) {
  nearbySearch(location: $location) {
    name
    coordinates {
      lat
      lng
    }
  }
}`;

function ElsewhereMap(props) {
  const router = useRouter();
  const [activeMarker, setActiveMarker] = useState({});
  const [activeInfoWindow, setActiveInfoWindow] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [searchFieldText, setSearchFieldText] = useState('');
  const [mapCenterLat, setMapCenterLat] = useState(0); // TODO use map's initial center
  const [mapCenterLng, setMapCenterLng] = useState(0);
  const { google } = props;
  const classes = useStyles(props);

  useEffect(() => {
    getSession().then((session) => {
      if (!session) router.push('/signin');
    });
  }, []);

  function onInfoWindowClose() {
    if (activeMarker.notSaved) {
      const index = markers.findIndex(
        (marker) => marker.coordinates.lat === activeMarker.coordinates.lat
          && marker.coordinates.lng === activeMarker.coordinates.lng,
      );
      if (index !== -1) {
        markers.splice(index, 1);
      }
    }

    setActiveInfoWindow(false);
    setActiveMarker({});
  }

  function onMapReady(mapProps, map) {
    fetcher(getMarkers, { mapId: router.query.id }).then(({
      getMarkers: mapMarkers,
    }) => {
      setMarkers(mapMarkers);
      const bounds = new google.maps.LatLngBounds();
      mapMarkers.forEach((marker) => {
        bounds.extend({
          lat: marker.coordinates.lat,
          lng: marker.coordinates.lng,
        });
      });
      map.fitBounds(bounds);
    });
  }

  function onMapClick(mapProps, map, clickEvent) {
    // const marker = {
    //   coordinates: {
    //     lat: clickEvent.latLng.lat(),
    //     lng: clickEvent.latLng.lng(),
    //   },
    // };

    // const variables = {
    //   mapId: router.query.id,
    //   markers: [
    //     marker,
    //   ],
    // };

    // fetcher(createMarkers, variables).then(({ createMarkers: success }) => {
    //   if (success) {
    //     setActiveInfoWindow(false);
    //     setActiveMarker({});
    //     setMarkers([...markers, marker]);
    //   } else {
    //     setActiveInfoWindow(false);
    //     setActiveMarker({});
    //   }
    // });

    const nearbyPlacesVars = {
      location: {
        lat: clickEvent.latLng.lat(),
        lng: clickEvent.latLng.lng(),
      },
    };

    fetcher(nearbyPlaces, nearbyPlacesVars).then(({
      nearbySearch: foundNearbyPlaces,
    }) => {
      const [nearbyPlace] = foundNearbyPlaces;
      nearbyPlace.notSaved = true;
      const {
        name,
        coordinates: {
          lat,
          lng,
        },
      } = nearbyPlace;
      if (name && lat && lng) {
        setActiveInfoWindow(true);
        setActiveMarker(nearbyPlace);
        setMarkers([...markers, nearbyPlace]);
      } else {
        setActiveInfoWindow(false);
        setActiveMarker({});
      }
    });
  }

  function onMapCenterChanged(mapProps, map) {
    setMapCenterLat(map.center.lat());
    setMapCenterLng(map.center.lng());
  }

  function saveMarker() {
    const variables = {
      mapId: router.query.id,
      markers: [
        {
          coordinates: activeMarker.coordinates,
          name: activeMarker.name,
        },
      ],
    };

    fetcher(createMarkers, variables).then(({ createMarkers: success }) => {
      if (success) {
        markers.forEach((marker) => {
          if (marker.coordinates.lat === activeMarker.coordinates.lat
            && marker.coordinates.lng === activeMarker.coordinates.lng) {
            // eslint-disable-next-line no-param-reassign
            marker.notSaved = false;
          }
        });
        setActiveInfoWindow(false);
        setActiveMarker({});
        // setMarkers([...markers, activeMarker]);
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
        {
          coordinates: activeMarker.coordinates,
          name: activeMarker.name,
        },
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
          coordinates,
          notSaved: true,
        };
        setMarkers([...markers, searchMarker]);
        setActiveMarker(searchMarker);
        setActiveInfoWindow(true);
      });
  }

  return (
    <Layout mapPage>
      {/* <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
        className={classes.infoWindowGrid}
      >
        <Grid item xs={8}>
          <Card
            hidden={!activeInfoWindow}
          >
            <Grid
              container
              direction="column"
              justify="center"
              alignItems="flex-start"
              spacing={3}
            >
              <Grid item xs={12}>
                <Typography variant="h5">Name</Typography>
                {
                  activeMarker.name ? (
                    <Typography variant="body1">{activeMarker.name}</Typography>
                  )
                    : (
                      <Typography variant="body1" fontStyle="italic">_____</Typography>
                    )
                }
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h5">Latitude</Typography>
                <Typography variant="body1">{activeMarker.coordinates ? activeMarker.coordinates.lat : null}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h5">Longitude</Typography>
                <Typography variant="body1">{activeMarker.coordinates ? activeMarker.coordinates.lng : null}</Typography>
              </Grid>
              <Grid item xs={12}>
                {activeMarker.notSaved ? (
                  <Button
                    variant="contained"
                    className={classes.saveButton}
                    startIcon={<SaveIcon />}
                    onClick={saveMarker}
                  >
                    Save Marker
                  </Button>
                )
                  : (
                    <Button
                      variant="contained"
                      className={classes.deleteButton}
                      startIcon={<DeleteIcon />}
                      onClick={deleteMarker}
                    >
                      Delete Marker
                    </Button>
                  )}
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid> */}

      <Box
        className={classes.searchBox}
      >
        <Grid
          container
          direction="column"
          justify="space-evenly"
          alignItems="flex-start"
          spacing={3}
        >
          <Grid item xs={12}>
            <Grid
              container
              direction="column"
              justify="space-evenly"
              alignItems="flex-start"
              spacing={2}
            >
              <Grid item xs={12}>
                <TextField
                  id="outlined-basic"
                  value={searchFieldText}
                  label="Search for a place"
                  variant="outlined"
                  onChange={(e) => handleSearchFieldTextChange(e)}
                  className={classes.searchTextField}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={(e) => searchForPlace(e)}
                  className={classes.searchButton}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      <Box>
        <Map
          google={google}
          zoom={14}
          onClick={onMapClick}
          onCenterChanged={onMapCenterChanged}
          onReady={onMapReady}
        >

          {markers.length ? markers.map((marker) => (
            <Marker
              key={marker.coordinates.lat.toString().concat(marker.coordinates.lng.toString())}
              position={marker.coordinates}
              onClick={() => {
                setActiveMarker(marker);
                setActiveInfoWindow(true);
              }}
            />
          )) : null}

          <Drawer
            anchor="right"
            open={activeInfoWindow}
            onClose={onInfoWindowClose}
            classes={{ paper: classes.infoWindowDrawerPaper }}
          >
            <Grid
              container
              direction="column"
              justify="center"
              alignItems="flex-start"
              spacing={3}
            >
              <Grid item>
                <Typography variant="h5">Name</Typography>
                {
                  activeMarker.name ? (
                    <Typography variant="body1">{activeMarker.name}</Typography>
                  )
                    : (
                      <Typography variant="body1" fontStyle="italic">Make this a textfield</Typography>
                    )
                }
              </Grid>
              <Grid item>
                <Typography variant="h5">Latitude</Typography>
                <Typography variant="body1">{activeMarker.coordinates ? activeMarker.coordinates.lat : null}</Typography>
              </Grid>
              <Grid item>
                <Typography variant="h5">Longitude</Typography>
                <Typography variant="body1">{activeMarker.coordinates ? activeMarker.coordinates.lng : null}</Typography>
              </Grid>
              <Grid item>
                {activeMarker.notSaved ? (
                  <Button
                    variant="contained"
                    className={classes.saveButton}
                    startIcon={<SaveIcon />}
                    onClick={saveMarker}
                  >
                    Save Marker
                  </Button>
                )
                  : (
                    <Button
                      variant="contained"
                      className={classes.deleteButton}
                      startIcon={<DeleteIcon />}
                      onClick={deleteMarker}
                    >
                      Delete Marker
                    </Button>
                  )}
              </Grid>
            </Grid>
          </Drawer>

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
