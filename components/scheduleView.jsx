import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import LoadingPage from './loadingPage';
import Schedule from './schedule';

const newEntryScheduleId = 'newentry';

function ScheduleView({
  entries,
  activeEntry,
  setActiveEntry,
  newEntryData,
  // setNewEntryData,
}) {
  const sortedEntries = useMemo(() => {
    const noTime = [];
    const withTime = [];
    // Add styling for schedule's event
    const newEntryWithStyle = {
      ...newEntryData,
      id: newEntryScheduleId,
      style: {
        bgcolor: 'secondary.main',
      },
    };
    entries.concat(newEntryWithStyle).forEach((entry) => {
      // Prefer active data because it might have updates
      let entryData = entry;
      if (entry.id === activeEntry.id) entryData = activeEntry;

      if (entryData.startTimestamp && entryData.endTimestamp) {
        // If there are any errors converting to dates,
        // just act like it doesn't have those props
        try {
          const startDate = new Date(entryData.startTimestamp);
          const endDate = new Date(entryData.endTimestamp);
          withTime.push({
            ...entryData,
            startTimestamp: startDate,
            endTimestamp: endDate,
          });
        } catch (err) {
          // Only want the new entry if it has times
          if (entry.id !== newEntryScheduleId) noTime.push(entryData);
        }
      } else if (entry.id !== newEntryScheduleId) {
        // Only want the new entry if it has times
        noTime.push(entryData);
      }
    });
    return {
      noTime,
      withTime,
    };
  }, [entries, newEntryData]);

  if (entries.length > 0) {
    return (
      <Box>

        {sortedEntries.noTime.length
          ? (
            <Divider
              variant="fullWidth"
              sx={{
                width: '100%',
                my: 3,
              }}
            >
              <Typography variant="h6">
                Unscheduled Events
              </Typography>
            </Divider>
          )
          : null}

        {sortedEntries.noTime.map((entry) => (
          <Paper
            key={entry.id}
            onClick={() => {
              if (activeEntry.id === entry.id) {
                setActiveEntry({});
              } else {
                setActiveEntry(entry);
              }
            }}
            sx={{
              bgcolor: 'primary.main',
              m: 1,
              p: 1,
              width: '100%',
              opacity: !activeEntry.id || activeEntry.id === entry.id ? '1.0' : '0.60',
            }}
          >
            <Typography variant="body1">
              {entry.name || 'No name'}
            </Typography>
          </Paper>
        ))}


        {sortedEntries.withTime.length
          ? (
            <>
              <Divider
                variant="fullWidth"
                sx={{
                  width: '100%',
                  my: 3,
                }}
              >
                <Typography variant="h6">
                  Scheduled Events
                </Typography>
              </Divider>
              <Schedule
                entries={sortedEntries.withTime}
                activeEntry={activeEntry}
                startKey="startTimestamp"
                endKey="endTimestamp"
                entryOnClick={(e, entry) => {
                  if (entry.id === newEntryScheduleId) return;
                  if (activeEntry.id === entry.id) {
                    setActiveEntry({});
                  } else {
                    setActiveEntry(entry);
                  }
                }}
              />
            </>
          )
          : null}
      </Box>
    );
  }


  return <LoadingPage />;
}

ScheduleView.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  activeEntry: PropTypes.object.isRequired,
  setActiveEntry: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  newEntryData: PropTypes.object.isRequired,
  // setNewEntryData: PropTypes.func.isRequired,
};

export default memo(ScheduleView);
