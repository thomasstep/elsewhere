import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';

import Map from './map';
import Marker from './marker';
import {
  debug,
} from '../utils/config';

function MapView({
  entries,
  activeEntry,
  setActiveEntry,
  newEntryData,
  setNewEntryData,
}) {
  const [bounds, setBounds] = useState(null);

  useEffect(() => {
    if (!(entries.length > 0)) {
      return;
    }

    // eslint-disable-next-line no-undef
    const newBounds = new google.maps.LatLngBounds();
    entries.forEach((entry) => {
      if (
        !entry.location
        || !entry.location.latitude
        || !entry.location.longitude) {
        return;
      }

      newBounds.extend({
        lat: entry.location.latitude,
        lng: entry.location.longitude,
      });
    });
    if (debug) {
      console.groupCollapsed('MAP VIEW BOUNDS SET');
      console.log(newBounds);
      console.groupEnd();
    }

    setBounds(newBounds);
  }, [entries]);

  return (
    <Box>

      <Map
        zoom={3}
        center={{ lat: 0, lng: 0 }}
        bounds={bounds}
        onClick={(e) => {
          // Behavior: if there is an active entry, unset the active entry
          //           if there is the new entry is mapped, unset its location
          //           if there is not an active entry or mapped new entry,
          //             set new entry's location
          if (activeEntry.id) {
            // Unset active entry if click is not on a marker
            setActiveEntry({});
          } else if (
            newEntryData.location
            && newEntryData.location.latitude
            && newEntryData.location.longitude
          ) {
            // Reset new entry's location
            const {
              location,
              ...newEntryDataNoLocation
            } = newEntryData;
            setNewEntryData({
              ...newEntryDataNoLocation,
            });
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
        // TODO is there a better way to do this instead of passing new entry data and setter?
        newEntryData={newEntryData}
        setNewEntryData={setNewEntryData}
        zoomControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        mapType="TERRAIN"
        mapTypeControl={false}
        // clickableIcons
        style={{ height: '100vh', width: '100%' }}
      >

        {entries.length ? entries.map((entry) => {
          if (
            !entry.location
            || !entry.location.latitude
            || !entry.location.longitude) return null;

          let animate = null;
          if (entry.id === activeEntry.id) {
            animate = true;
          }

          const googleMarker = (
            // TODO https://developers.google.com/maps/documentation/javascript/advanced-markers/accessible-markers#make_a_marker_draggable
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
              key="new-entry"
              position={{
                lat: newEntryData.location.latitude,
                lng: newEntryData.location.longitude,
              }}
              label={{
                text: '\ue145',
                fontFamily: 'Material Icons',
                color: '#ffffff',
                fontSize: '18px',
              }}
              // Animate if there's no ID (not a real entry)
              // and lat/lng match new entry
              animation={
                !activeEntry.id
                // eslint-disable-next-line no-undef
                && google.maps.Animation.BOUNCE
}
            />
          )
          : null}

      </Map>
    </Box>
  );
}

MapView.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  activeEntry: PropTypes.object.isRequired,
  setActiveEntry: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  newEntryData: PropTypes.object.isRequired,
  setNewEntryData: PropTypes.func.isRequired,
};

export default MapView;
