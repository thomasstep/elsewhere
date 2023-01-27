import { useState, useEffect } from 'react';

function Marker(options) {
  const [marker, setMarker] = useState();

  useEffect(() => {
    if (!marker) {
      // eslint-disable-next-line no-undef
      setMarker(new google.maps.Marker());
    }

    // remove marker from map on unmount
    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [marker]);
  useEffect(() => {
    if (marker) {
      marker.setOptions(options);
    }
  }, [marker, options]);
  return null;
}

export default Marker;
