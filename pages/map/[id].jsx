import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import React, { useState, useEffect } from 'react';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';
import { fetcher } from '../../utils/fetcher';
import Layout from '../../components/layout';

const useStyles = makeStyles((theme) => ({
  searchBox: {
    left: theme.spacing(1),
    bottom: theme.spacing(1),
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
  infoWindowDrawerPaper: {
    width: '80%',
    padding: theme.spacing(3),
  },
}));

const viewerQuery = `{
  viewer {
    email
  }
}`;

const getMarkers = `query getMarkers (
    $mapId: ID!
  ) {
  getMarkers(mapId: $mapId) {
    markerId
    coordinates {
      lat
      lng
    }
    name
    createdBy
    notes
  }
}`;

const updateMarker = `mutation updateMarker(
  $updates: MarkerUpdateInput!
  $isName: Boolean=false
  $isNotes: Boolean=false
) {
  updateMarker(updates: $updates) {
    markerName @include(if: $isName)
    notes @include(if: $isNotes)
  }
}`;

const createMarker = `mutation createMarker(
  $mapId: ID!
  $marker: MarkerInput!
) {
  createMarker(mapId: $mapId, marker: $marker) {
    ... on Marker {
      markerId
      name
    }
  }
}`;

const deleteMarkers = `mutation deleteMarkers(
  $mapId: ID!
  $markerIds: [ID]!
) {
  deleteMarkers(mapId: $mapId, markerIds: $markerIds)
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
  const [userEmail, setUserEmail] = useState('');
  const [activeMarker, setActiveMarker] = useState({});
  const [editedActiveMarkerName, setEditedActiveMarkerName] = useState('');
  const [editedActiveMarkerNotes, setEditedActiveMarkerNotes] = useState('');
  const [activeInfoWindow, setActiveInfoWindow] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [searchFieldText, setSearchFieldText] = useState('');
  const [mapCenterLat, setMapCenterLat] = useState(0);
  const [mapCenterLng, setMapCenterLng] = useState(0);
  const { google } = props;
  const classes = useStyles(props);

  useEffect(() => {
    fetcher(viewerQuery)
      .then(({
        viewer: {
          email: viewerEmail,
        },
      }) => {
        if (!viewerEmail) router.push('/signin');
        setUserEmail(viewerEmail);
      })
      .catch(() => {
        router.push('/signin');
      });
  }, []);

  function onInfoWindowClose() {
    if (activeMarker.notSaved) {
      const index = markers.findIndex(
        (marker) => marker.markerId === activeMarker.markerId,
      );
      if (index !== -1) {
        markers.splice(index, 1);
      }
    }

    setActiveInfoWindow(false);
    setActiveMarker({});
    setEditedActiveMarkerName('');
    setEditedActiveMarkerNotes('');
  }

  async function saveActiveMarkerName() {
    if (activeMarker.name !== editedActiveMarkerName && activeMarker.markerId) {
      const updates = {
        mapId: router.query.id,
        markerId: activeMarker.markerId,
        markerName: editedActiveMarkerName,
      };

      fetcher(updateMarker, { updates, isName: true }).then(({
        updateMarker: {
          markerName: updateSuccess,
        },
      }) => {
        if (updateSuccess) {
          const index = markers.findIndex(
            (marker) => marker.markerId === activeMarker.markerId,
          );
          if (index !== -1) {
            markers[index] = {
              ...activeMarker,
              name: editedActiveMarkerName,
            };
          }

          setActiveMarker({
            ...activeMarker,
            name: editedActiveMarkerName,
          });
        } else {
          setEditedActiveMarkerName(activeMarker.name);
        }
      });
    }
  }

  function handleActiveMarkerNameTextFieldChange(event) {
    setEditedActiveMarkerName(event.target.value);
  }

  async function saveActiveMarkerNotes() {
    if (activeMarker.notes !== editedActiveMarkerNotes && activeMarker.markerId) {
      const updates = {
        mapId: router.query.id,
        markerId: activeMarker.markerId,
        notes: editedActiveMarkerNotes,
      };

      fetcher(updateMarker, { updates, isNotes: true }).then(({
        updateMarker: {
          notes: updateSuccess,
        },
      }) => {
        if (updateSuccess) {
          const index = markers.findIndex(
            (marker) => marker.markerId === activeMarker.markerId,
          );
          if (index !== -1) {
            markers[index] = {
              ...activeMarker,
              notes: editedActiveMarkerNotes,
            };
          }

          setActiveMarker({
            ...activeMarker,
            notes: editedActiveMarkerNotes,
          });
        } else {
          setEditedActiveMarkerNotes(activeMarker.notes);
        }
      });
    }
  }

  function handleActiveMarkerNotesTextFieldChange(event) {
    setEditedActiveMarkerNotes(event.target.value);
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
      const boundsCenter = bounds.getCenter();
      setMapCenterLat(boundsCenter.lat());
      setMapCenterLng(boundsCenter.lng());
    });
  }

  function onMapClick(mapProps, map, clickEvent) {
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
      marker: {
        coordinates: activeMarker.coordinates,
        name: editedActiveMarkerName || activeMarker.name,
      },
    };

    console.log(variables)

    fetcher(createMarker, variables).then(({ createMarker: createMarkerRes }) => {
      if (createMarkerRes) {
        activeMarker.notSaved = false;
        activeMarker.markerId = createMarkerRes.markerId;
        activeMarker.createdBy = userEmail;
        activeMarker.name = createMarkerRes.name;
      }
      setActiveInfoWindow(false);
      setActiveMarker({});
      setEditedActiveMarkerName('');
    });
  }

  function deleteMarker() {
    const variables = {
      mapId: router.query.id,
      markerIds: [activeMarker.markerId],
    };

    fetcher(deleteMarkers, variables).then(({ deleteMarkers: success }) => {
      if (success) {
        setActiveInfoWindow(false);
        const index = markers.findIndex(
          (marker) => marker.markerId === activeMarker.markerId,
        );
        if (index !== -1) {
          markers.splice(index, 1);
        }
        setActiveMarker({});
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
          name: searchFieldText,
          notSaved: true,
        };
        setMarkers([...markers, searchMarker]);
        setActiveMarker(searchMarker);
        setActiveInfoWindow(true);
      });
  }

  return (
    <Layout mapPage session={userEmail}>

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
          zoom={3}
          onClick={onMapClick}
          onCenterChanged={onMapCenterChanged}
          onReady={onMapReady}
          zoomControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          mapType="TERRAIN"
          mapTypeControl={false}
          clickableIcons
        >

          {markers.length ? markers.map((marker) => (
            <Marker
              key={marker.markerId}
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
              alignItems="baseline"
              wrap="nowrap"
              spacing={3}
            >
              {/* Name field */}
              <Grid item xs={12}>
                <Grid
                  container
                  direction="row"
                  justify="center"
                  alignItems="center"
                  spacing={2}
                >
                  <Grid item>
                    <TextField
                      id="filled-basic"
                      value={editedActiveMarkerName || activeMarker.name}
                      label="Marker Name"
                      variant="outlined"
                      onChange={(e) => handleActiveMarkerNameTextFieldChange(e)}
                    />
                  </Grid>
                  {
                    activeMarker.notSaved ? (
                      null
                    ) : (
                      <Grid item>
                        <IconButton
                          aria-label="save"
                          onClick={saveActiveMarkerName}
                        >
                          <SaveIcon />
                        </IconButton>
                      </Grid>
                    )
                  }
                </Grid>
              </Grid>

              {/* Placed By field */}
              {
                activeMarker.createdBy ? (
                  <Grid item xs={12}>
                    <Typography variant="h5">Created By</Typography>
                    <Typography variant="body1">{activeMarker.createdBy}</Typography>
                  </Grid>
                ) : null
              }

              {/* Notes field */}
              {
                activeMarker.notSaved ? null : (
                  <Grid item xs={12}>
                    <Grid
                      container
                      direction="row"
                      justify="center"
                      alignItems="center"
                      spacing={2}
                    >
                      <Grid item>
                        <TextField
                          id="filled-basic"
                          value={editedActiveMarkerNotes || activeMarker.notes}
                          label="Notes"
                          variant="outlined"
                          onChange={(e) => handleActiveMarkerNotesTextFieldChange(e)}
                          multiline
                          rowsMax={10}
                        />
                      </Grid>
                      <Grid item>
                        <IconButton
                          aria-label="save"
                          onClick={saveActiveMarkerNotes}
                        >
                          <SaveIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Grid>
                )
              }

              {/* Lat field */}
              <Grid item xs={12}>
                <Typography variant="h5">Latitude</Typography>
                <Typography variant="body1">{activeMarker.coordinates ? activeMarker.coordinates.lat : null}</Typography>
              </Grid>

              {/* Lng field */}
              <Grid item xs={12}>
                <Typography variant="h5">Longitude</Typography>
                <Typography variant="body1">{activeMarker.coordinates ? activeMarker.coordinates.lng : null}</Typography>
              </Grid>

              {/* Save or delete button */}
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
