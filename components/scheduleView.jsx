import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import LoadingPage from './loadingPage';
import Schedule from './schedule';

function ScheduleView({
  entries,
  activeEntry,
  setActiveEntry,
  newEntryData,
  setNewEntryData,
}) {
  if (entries.length > 0) {
    const noTime = [];
    let withTime = [];
    entries.forEach((entry) => {
      if (entry.startTimestamp && entry.endTimestamp) {
        // If there are any errors converting to dates,
        // just act like it doesn't have those props
        try {
          const startDate = new Date(entry.startTimestamp);
          const endDate = new Date(entry.endTimestamp);
          withTime.push({
            ...entry,
            startTimestamp: startDate,
            endTimestamp: endDate,
          });
        } catch (err) {
          noTime.push(entry);
        }
      } else {
        noTime.push(entry);
      }
    });
    withTime = withTime.sort((a, b) => a.startTimestamp - b.startTimestamp);

    return (
      <Box
        sx={{
          height: '100vh',
          overflow: 'hidden',
          overflowY: 'scroll',
        }}
      >
        {/* TODO show entries without any times */}
        <Schedule
          entries={withTime}
          startKey={'startTimestamp'}
          endKey={'endTimestamp'}
        />
      </Box>
    );
  }


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
