// From: https://github.com/googlemaps/js-samples/blob/c1036e60d2f50056fba1617a1be507b00b6cac5a/dist/samples/react-map/docs/index.jsx
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { createCustomEqual } from 'fast-equals';
import { isLatLngLiteral } from '@googlemaps/typescript-guards';
import TextField from '@mui/material/TextField';

import { debug } from '../utils/config';

const deepCompareEqualsForMaps = createCustomEqual((deepEqual) => (a, b) => {
  if (
    isLatLngLiteral(a)
    // eslint-disable-next-line no-undef
    || a instanceof google.maps.LatLng
    // eslint-disable-next-line no-undef
    || b instanceof google.maps.LatLng
  ) {
    // eslint-disable-next-line no-undef
    return new google.maps.LatLng(a).equals(new google.maps.LatLng(b));
  }
  // TODO extend to other types
  // use fast-equals for other objects
  return deepEqual(a, b);
});

function useDeepCompareMemoize(value) {
  const ref = useRef();

  if (!deepCompareEqualsForMaps(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
}

function useDeepCompareEffectForMaps(callback, dependencies) {
  useEffect(callback, dependencies.map(useDeepCompareMemoize));
}

function Map({
  bounds,
  onClick,
  newEntryData,
  setNewEntryData,
  onIdle,
  children,
  style,
  ...options
}) {
  const mapRef = useRef(null);
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [map, setMap] = useState();
  const [autocompleteWidget, setAutocompleteWidget] = useState();

  // Setup map
  useEffect(() => {
    if (mapRef.current && !map) {
      // eslint-disable-next-line no-undef
      const newMap = new window.google.maps.Map(mapRef.current, {});

      setMap(newMap);

      if (bounds) {
        if (debug) {
          console.log('FITTING MAP INITIAL BOUNDS');
        }

        newMap.fitBounds(bounds);
      }
    }
  }, [mapRef, map]);

  // Setup autocomplete
  useEffect(() => {
    if (inputRef.current && !autocompleteWidget) {
      // eslint-disable-next-line no-undef
      const acw = new google.maps.places.Autocomplete(inputRef.current);
      autocompleteRef.current = acw;
      setAutocompleteWidget(acw);
    }
  }, [inputRef, autocompleteWidget]);

  // Additional map-dependent autocomplete setup
  // This is where new entries are updated
  useEffect(() => {
    if (map && autocompleteWidget) {
      autocompleteWidget.bindTo('bounds', map);
      autocompleteWidget.addListener('place_changed', () => {
        const place = autocompleteWidget.getPlace();

        if (!place.geometry || !place.geometry.location) {
          // User entered the name of a Place that was not suggested and
          // pressed the Enter key, or the Place Details request failed.
          // window.alert("No details available for input: '" + place.name + "'");
          return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location);
          map.setZoom(17);
        }

        if (debug) {
          console.groupCollapsed('PLACE UPDATE');
          console.log(place);
          console.groupEnd();
        }

        setNewEntryData({
          ...newEntryData,
          name: place.name,
          location: {
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            address: place.formatted_address,
          },
        });
      });
    }
  });

  // because React does not do deep comparisons, a custom hook is used
  // see discussion in https://github.com/googlemaps/js-samples/issues/946
  useDeepCompareEffectForMaps(() => {
    if (map) {
      map.setOptions(options);
    }
  }, [map, options]);

  useEffect(() => {
    if (map) {
      // eslint-disable-next-line no-undef
      ['click', 'idle'].forEach((eventName) => google.maps.event.clearListeners(map, eventName));
      if (onClick) {
        map.addListener('click', onClick);
      }

      if (onIdle) {
        map.addListener('idle', () => onIdle(map));
      }
    }
  }, [map, onClick, onIdle]);

  useEffect(() => {
    if (map && bounds) {
      if (debug) {
        console.log('FITTING MAP BOUNDS');
      }

      map.fitBounds(bounds);
    }
  }, [map, bounds]);

  return (
    <>
      <TextField
        inputRef={inputRef}
        sx={{
          pb: 3,
        }}
      />
      <div ref={mapRef} style={style} />
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // set the map prop on the child component
          // @ts-ignore
          return React.cloneElement(child, { map });
        }
        return null;
      })}
    </>
  );
}

Map.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  bounds: PropTypes.object,
  onClick: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  newEntryData: PropTypes.object,
  setNewEntryData: PropTypes.func,
  onIdle: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node).isRequired,
    PropTypes.node.isRequired,
  ]),
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object.isRequired,
};

Map.defaultProps = {
  bounds: null,
  onClick: () => {},
  newEntryData: {},
  setNewEntryData: () => {},
  onIdle: () => {},
  children: null,
};

export default Map;
