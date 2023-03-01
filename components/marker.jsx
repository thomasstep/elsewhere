import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function Marker({
  onClick,
  onDragEnd,
  ...options
}) {
  const [marker, setMarker] = useState();
  const [clickListener, setClickListener] = useState();
  const [dragEndListener, setDragEndListener] = useState();

  useEffect(() => {
    if (!marker) {
      // eslint-disable-next-line no-undef
      const newMarker = new google.maps.Marker();
      const clk = newMarker.addListener('click', (e) => {
        onClick(e);
      });
      setClickListener(clk);
      const de = newMarker.addListener('dragend', (e) => {
        const lat = newMarker.position.lat();
        const lng = newMarker.position.lng();
        onDragEnd(e, lat, lng);
      });
      setDragEndListener(de);
      setMarker(newMarker);
    }

    // remove marker from map on unmount
    return () => {
      if (marker) {
        marker.setMap(null);
        // eslint-disable-next-line no-undef
        google.maps.event.removeListener(clickListener);
        // eslint-disable-next-line no-undef
        google.maps.event.removeListener(dragEndListener);
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
  onDragEnd: PropTypes.func,
};

Marker.defaultProps = {
  onClick: () => {},
  onDragEnd: () => {},
};

export default Marker;
