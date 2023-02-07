import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function Marker({
  onClick,
  ...options
}) {
  const [marker, setMarker] = useState();
  const [clickListener, setClickListener] = useState();

  useEffect(() => {
    if (!marker) {
      // eslint-disable-next-line no-undef
      const newMarker = new google.maps.Marker();
      const clk = newMarker.addListener('click', (e) => {
        onClick(e);
      });
      setMarker(newMarker);
      setClickListener(clk);
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

  // This effect updates click listeners by removing the old
  //  one and adding a new one
  useEffect(() => {
    if (marker && clickListener) {
      // eslint-disable-next-line no-undef
      google.maps.event.removeListener(clickListener);
      const clk = marker.addListener('click', (e) => {
        onClick(e);
      });
      setClickListener(clk);
    }
  }, [marker, onClick]);
  return null;
}

Marker.propTypes = {
  onClick: PropTypes.func,
};

Marker.defaultProps = {
  onClick: () => {},
};

export default Marker;
