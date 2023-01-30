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
        // onClick={(mp, m, e) => onMapClick(mp, m, e)}
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
              onClick={(props, googleMarker) => {
                // eslint-disable-next-line no-undef
                googleMarker.setAnimation(google.maps.Animation.BOUNCE);
                // setActiveGoogleMarker(googleMarker);
                // setActiveEntry(entry);
                // setActiveInfoWindow(true);
              }}
              // eslint-disable-next-line no-undef
              animation={animate && google.maps.Animation.BOUNCE}
            />
          );

          return googleMarker;
        }) : null}

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
