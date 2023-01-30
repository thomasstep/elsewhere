import React from 'react';
import PropTypes from 'prop-types';

import LoadingPage from './loadingPage';

function NewEntryForm({
  entries,
  setEntries,
  newEntryData,
  setNewEntryData,
}) {
  return <LoadingPage />;
}

NewEntryForm.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
  setEntries: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  newEntryData: PropTypes.object.isRequired,
  setNewEntryData: PropTypes.func.isRequired,
};

export default NewEntryForm;
