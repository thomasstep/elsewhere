import React from 'react';
import PropTypes from 'prop-types';

import LoadingPage from './loadingPage';

function ScheduleView({
  entries,
  activeEntry,
  setActiveEntry,
  newEntryData,
  setNewEntryData,
}) {
  return <LoadingPage />;
}

ScheduleView.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  activeEntry: PropTypes.object.isRequired,
  setActiveEntry: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  newEntryData: PropTypes.object.isRequired,
  setNewEntryData: PropTypes.func.isRequired,
};

export default ScheduleView;
