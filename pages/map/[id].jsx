import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Drawer from '@material-ui/core/Drawer';
import MapIcon from '@material-ui/icons/Map';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import React, { useState, useEffect } from 'react';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';
import Layout from '../../components/layout';
import {
  elsewhereApiUrl,
  authenticationServiceUrl,
  applicationId,
  jwtCookieName,
  googleMapsKey,
} from '../../utils/config';
import {
  getCookie,
} from '../../utils/util';

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
  infoWindowDrawerSeeThroughPaper: {
    width: '80%',
    padding: theme.spacing(3),
    opacity: '50%',
  },
}));

function ElsewhereMap(props) {
  const router = useRouter();
  const [id, setId] = useState('');
  const [activeMarker, setActiveMarker] = useState({});
  const [activeGoogleMarker, setActiveGoogleMarker] = useState(null);
  const [editedActiveMarkerName, setEditedActiveMarkerName] = useState('');
  const [editedActiveMarkerNotes, setEditedActiveMarkerNotes] = useState('');
  const [activeInfoWindow, setActiveInfoWindow] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [searchFieldText, setSearchFieldText] = useState('');
  const [mapCenterLat, setMapCenterLat] = useState(0);
  const [mapCenterLng, setMapCenterLng] = useState(0);
  const { google } = props;
  const classes = useStyles(props);
  const [drawerPaperClass, setDrawerPaperClass] = useState(classes.infoWindowDrawerPaper);
  const googleMarkers = {};
  const token = getCookie(jwtCookieName);

  useEffect(() => {
    fetch(`${authenticationServiceUrl}/v1/applications/${applicationId}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status !== 200) router.push('/signin');

        return res.json();
      })
      .then((data) => {
        setId(data.id);
      })
      .catch(() => {
        router.push('/signin');
      });
  }, []);

  function onInfoWindowClose() {
    if (activeMarker.notSaved) {
      const index = markers.findIndex(
        (marker) => marker.id === activeMarker.id,
      );
      if (index !== -1) {
        markers.splice(index, 1);
      }
    }

    setActiveInfoWindow(false);
    try {
      activeGoogleMarker.setAnimation(null);
    } catch (err) {
      // Shit happens
    }
    setActiveGoogleMarker(null);
    setActiveMarker({});
    setEditedActiveMarkerName('');
    setEditedActiveMarkerNotes('');
  }

  async function saveActiveMarkerName() {
    if (activeMarker.name !== editedActiveMarkerName && activeMarker.id) {
      const updates = {
        name: editedActiveMarkerName,
      };

      fetch(`${elsewhereApiUrl}/v1/trip/${router.query.id}/entry/${activeMarker.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })
        .then((res) => {
          if (res.status === 200) {
            const index = markers.findIndex(
              (marker) => marker.id === activeMarker.id,
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
    if (activeMarker.notes !== editedActiveMarkerNotes && activeMarker.id) {
      const updates = {
        notes: editedActiveMarkerNotes,
      };

      fetch(`${elsewhereApiUrl}/v1/trip/${router.query.id}/entry/${activeMarker.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })
        .then((res) => {
          if (res.status === 200) {
            const index = markers.findIndex(
              (marker) => marker.id === activeMarker.id,
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
    fetch(`${elsewhereApiUrl}/v1/trip/${router.query.id}/entry`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status !== 200) console.log('REFRESH');

        return res.json();
      })
      .then((data) => {
        if (!data.length > 0) {
          return;
        }

        const bounds = new google.maps.LatLngBounds();
        data.forEach((entry) => {
          if (!entry.location.latitude || !entry.location.longitude) {
            return;
          }

          bounds.extend({
            lat: entry.location.latitude,
            lng: entry.location.longitude,
          });
        });
        map.fitBounds(bounds);
        const boundsCenter = bounds.getCenter();
        setMarkers(data);
        setMapCenterLat(boundsCenter.lat());
        setMapCenterLng(boundsCenter.lng());
      });
  }

  function onMapClick(mapProps, map, clickEvent) {
    const unsavedMarker = {
      notSaved: true,
      location: {
        latitude: clickEvent.latLng.lat(),
        longitude: clickEvent.latLng.lng(),
      },
    };
    setActiveInfoWindow(true);
    setActiveMarker(unsavedMarker);
    setMarkers([...markers, unsavedMarker]);
  }

  function onMapCenterChanged(mapProps, map) {
    setMapCenterLat(map.center.lat());
    setMapCenterLng(map.center.lng());
  }

  function saveMarker() {
    const updatedEntry = {
      name: editedActiveMarkerName || activeMarker.name,
      notes: editedActiveMarkerNotes || activeMarker.notes,
      location: activeMarker.location,
    };

    fetch(`${elsewhereApiUrl}/v1/trip/${router.query.id}/entry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedEntry),
    })
      .then((res) => {
        if (res.status !== 200) {
          console.log(res);
          // TODO error message
        }

        return res.json();
      })
      .then((data) => {
        if (data) {
          activeMarker.notSaved = false;
          activeMarker.id = data.id;
          activeMarker.createdBy = id;
          activeMarker.name = data.name;
          activeMarker.notes = data.notes;
        }
        try {
          activeGoogleMarker.setAnimation(null);
        } catch (err) {
          // Shit happens
        }
        setActiveGoogleMarker(null);
        setActiveMarker({});
        setActiveInfoWindow(false);
        setEditedActiveMarkerName('');
        setEditedActiveMarkerNotes('');
      });
  }

  function deleteMarker() {
    fetch(`${elsewhereApiUrl}/v1/trip/${router.query.id}/entry/${activeMarker.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 204) {
          setActiveInfoWindow(false);
          const index = markers.findIndex(
            (marker) => marker.id === activeMarker.id,
          );
          if (index !== -1) {
            markers.splice(index, 1);
          }
          try {
            activeGoogleMarker.setAnimation(null);
          } catch (err) {
            // Shit happens
          }
          setActiveGoogleMarker(null);
          setActiveMarker({});
        } else {
          setActiveInfoWindow(false);
          try {
            activeGoogleMarker.setAnimation(null);
          } catch (err) {
            // Shit happens

          }
          setActiveGoogleMarker(null);
          setActiveMarker({});
        }
      });
  }

  function handleSearchFieldTextChange(event) {
    setSearchFieldText(event.target.value);
  }

  // function searchForPlace() {
  //   const query = searchFieldText;
  //   const locationBias = {
  //     point: {
  //       lat: mapCenterLat,
  //       lng: mapCenterLng,
  //     },
  //   };

  //   fetcher(getPlace, { query, locationBias })
  //     .then(({ getPlace: places }) => {
  //       const [coordinates] = places;
  //       const searchMarker = {
  //         coordinates,
  //         name: searchFieldText,
  //         notSaved: true,
  //       };
  //       setActiveMarker(searchMarker);
  //       setMarkers([...markers, searchMarker]);
  //       setActiveInfoWindow(true);
  //     });
  // }

  return (
    <Layout mapPage session={id}>

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
                  onKeyDown={(e) => (
                    e.keyCode === 13 ? searchForPlace(e) : null
                  )}
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

          {markers.length ? markers.map((marker) => {
            let animate = null;
            if (marker.id === activeMarker.id) {
              animate = true;
            }

            const googleMarker = (
              <Marker
                key={marker.id}
                position={{
                  lat: marker.location.latitude,
                  lng: marker.location.longitude,
                }}
                onClick={(props, googleMarker) => {
                  googleMarker.setAnimation(google.maps.Animation.BOUNCE);
                  setActiveGoogleMarker(googleMarker);
                  setActiveMarker(marker);
                  setActiveInfoWindow(true);
                }}
                animation={animate && google.maps.Animation.BOUNCE}
              />
            );

            return googleMarker;
          }) : null}

          <Drawer
            anchor="right"
            open={activeInfoWindow}
            onClose={onInfoWindowClose}
            BackdropProps={{ invisible: true }}
            classes={{ paper: drawerPaperClass }}
          >
            <Grid
              container
              direction="column"
              justify="center"
              alignItems="baseline"
              wrap="nowrap"
              spacing={6}
            >
              {/* See Through Button */}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  // className={classes.saveButton}
                  color="primary"
                  startIcon={<MapIcon />}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setDrawerPaperClass(classes.infoWindowDrawerSeeThroughPaper);
                  }}
                  onMouseUp={(e) => {
                    e.preventDefault();
                    setDrawerPaperClass(classes.infoWindowDrawerPaper);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    setDrawerPaperClass(classes.infoWindowDrawerSeeThroughPaper);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    setDrawerPaperClass(classes.infoWindowDrawerPaper);
                  }}
                >
                  Press And Hold To See Map
                </Button>
              </Grid>

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
                  {
                    activeMarker.notSaved ? (
                      null
                    ) : (
                      <Grid item>
                        <IconButton
                          aria-label="save"
                          onClick={saveActiveMarkerNotes}
                        >
                          <SaveIcon />
                        </IconButton>
                      </Grid>
                    )
                  }
                </Grid>
              </Grid>

              {/* Lat field */}
              <Grid item xs={12}>
                <Typography variant="h5">Latitude</Typography>
                <Typography variant="body1">{activeMarker.location ? activeMarker.location.latitude : null}</Typography>
              </Grid>

              {/* Lng field */}
              <Grid item xs={12}>
                <Typography variant="h5">Longitude</Typography>
                <Typography variant="body1">{activeMarker.location ? activeMarker.location.longitude : null}</Typography>
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
  apiKey: googleMapsKey,
})(ElsewhereMap);
