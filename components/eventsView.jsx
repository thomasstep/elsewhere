import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import LoadingPage from './loadingPage';

function EventsView({
  entries,
  activeEntry,
  setActiveEntry,
}) {
  const [eventSearch, setEventSearch] = useState('');

  if (entries.length > 0) {
    return (
      <Box>
        <TextField
          value={eventSearch}
          label="Search"
          variant="standard"
          onChange={(e) => {
            setEventSearch(e.target.value);
          }}
          sx={{
            pb: 3,
          }}
        />

        {entries.map((entry) => {
          if ((eventSearch.length > 0 && entry?.name.toLowerCase().includes(eventSearch.toLowerCase())) || eventSearch === '') {
            return (
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
            );
          }

          return null;
        })}
      </Box>
    );
  }


  return <LoadingPage />;
}

EventsView.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  activeEntry: PropTypes.object.isRequired,
  setActiveEntry: PropTypes.func.isRequired,
};

export default memo(EventsView);
