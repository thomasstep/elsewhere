import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';

import Map from './map';
import Marker from './marker';

function MapView({
  entries,
  activeEntry,
  setActiveEntry,
  newEntryData,
  setNewEntryData,
}) {
  // useEffect(() => {
  //   if (!entries.length > 0) {
  //     return;
  //   }

  //   // eslint-disable-next-line no-undef
  //   const bounds = new google.maps.LatLngBounds();
  //   entries.forEach((entry) => {
  //     if (!entry.location.latitude || !entry.location.longitude) {
  //       return;
  //     }

  //     bounds.extend({
  //       lat: entry.location.latitude,
  //       lng: entry.location.longitude,
  //     });
  //   });
  //   map.fitBounds(bounds);
  //   const boundsCenter = bounds.getCenter();
  //   setMarkers(data);
  //   setMapCenterLat(boundsCenter.lat());
  //   setMapCenterLng(boundsCenter.lng());
  // }, []);

  return (
    <Box>
      <Map
        zoom={3}
        center={{ lat: 0, lng: 0 }}
        onClick={(e) => {
          // Behavior: if there is an active entry, only unset the active entry
          //           if there is no active entry, set new entry's location
          if (activeEntry.id) {
            // Unset active entry if click is not on a marker
            setActiveEntry({});
          } else {
            // Set new entry's location based on click
            setNewEntryData({
              ...newEntryData,
              location: {
                latitude: e.latLng.lat(),
                longitude: e.latLng.lng(),
              },
            });
          }
        }}
        // onCenterChanged={(mp, m) => onMapCenterChanged(mp, m)}
        // onReady={(mp, m) => onMapReady(mp, m)}
        zoomControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        mapType="TERRAIN"
        mapTypeControl={false}
        // clickableIcons
        style={{ height: '100vh', width: '100%' }}
      >

        {entries.length ? entries.map((entry) => {
          let animate = null;
          if (entry.id === activeEntry.id) {
            animate = true;
          }

          const googleMarker = (
            <Marker
              key={entry.id}
              position={{
                lat: entry.location.latitude,
                lng: entry.location.longitude,
              }}
              onClick={() => {
                setActiveEntry(entry);
              }}
              // eslint-disable-next-line no-undef
              animation={animate && google.maps.Animation.BOUNCE}
            />
          );

          return googleMarker;
        }) : null}

        {newEntryData
          && newEntryData.location
          && newEntryData.location.latitude
          && newEntryData.location.longitude
          ? (
              <Marker
                key={"new-entry"}
                position={{
                  lat: newEntryData.location.latitude,
                  lng: newEntryData.location.longitude,
                }}
                label={{
                  text: "\ue145",
                  fontFamily: "Material Icons",
                  color: "#ffffff",
                  fontSize: "18px",
                }}
              />
            )
          : null}

      </Map>
    </Box>
  );
}

MapView.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  activeEntry: PropTypes.object.isRequired,
  setActiveEntry: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  newEntryData: PropTypes.object.isRequired,
  setNewEntryData: PropTypes.func.isRequired,
};

export default MapView;
