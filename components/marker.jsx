import { useState, useEffect } from 'react';

function Marker({
  onClick,
  ...options
}) {
  const [marker, setMarker] = useState();

  useEffect(() => {
    if (!marker) {
      // eslint-disable-next-line no-undef
      const newMarker = new google.maps.Marker();
      newMarker.addListener('click', (e) => {
        onClick(e);
      });
      setMarker(newMarker);
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
