// From: https://github.com/googlemaps/js-samples/blob/c1036e60d2f50056fba1617a1be507b00b6cac5a/dist/samples/react-map/docs/index.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { createCustomEqual } from 'fast-equals';
import { isLatLngLiteral } from '@googlemaps/typescript-guards';

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
  const ref = React.useRef();

  if (!deepCompareEqualsForMaps(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
}

function useDeepCompareEffectForMaps(callback, dependencies) {
  React.useEffect(callback, dependencies.map(useDeepCompareMemoize));
}

function Map({
  onClick, onIdle, children, style, ...options
}) {
  // [START maps_react_map_component_add_map_hooks]
  const ref = React.useRef(null);
  const [map, setMap] = React.useState();

  React.useEffect(() => {
    if (ref.current && !map) {
      // eslint-disable-next-line no-undef
      setMap(new window.google.maps.Map(ref.current, {}));
    }
  }, [ref, map]);
  // [END maps_react_map_component_add_map_hooks]
  // [START maps_react_map_component_options_hook]
  // because React does not do deep comparisons, a custom hook is used
  // see discussion in https://github.com/googlemaps/js-samples/issues/946
  useDeepCompareEffectForMaps(() => {
    if (map) {
      map.setOptions(options);
    }
  }, [map, options]);
  // [END maps_react_map_component_options_hook]
  // [START maps_react_map_component_event_hooks]
  React.useEffect(() => {
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
  // [END maps_react_map_component_event_hooks]
  // [START maps_react_map_component_return]
  return (
    <>
      <div ref={ref} style={style} />
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
  // [END maps_react_map_component_return]
}

Map.propTypes = {
  onClick: PropTypes.func.isRequired,
  onIdle: PropTypes.func.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node).isRequired,
    PropTypes.node.isRequired,
  ]).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object.isRequired,
};

export default Map;
