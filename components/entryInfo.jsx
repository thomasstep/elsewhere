import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import Grid from '@mui/material/Grid';
import SaveIcon from '@mui/icons-material/Save';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DateTime, Settings } from 'luxon';

import DateTimeField from './dateTimeField';

Settings.defaultZone = 'utc';

function EntryInfo({
  entries,
  setEntries,
  activeEntry,
  setActiveEntry,
  updateEntry,
  deleteEntry,
  setSnackbarMessage,
  setSnackbarSeverity,
  setSnackbarOpen,
}) {
  // Boolean tells whether the entry has been edited
  const [edited, setEdited] = useState(false);
  // Using truthy on purpose
  // eslint-disable-next-line eqeqeq
  const activeEntryExists = typeof activeEntry.id === 'string' && activeEntry.id.length > 0;

  return (
    <Box>
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="baseline"
        wrap="nowrap"
        spacing={6}
      >
        {/* Name field */}
        <Grid item xs={12}>
          <Grid
            container
            direction="row"
            justify="center"
            alignItems="center"
            spacing={2}
          >
            <Grid item>
              <TextField
                id="filled-basic"
                value={activeEntry.name ? activeEntry.name : ''}
                disabled={!activeEntryExists}
                label="Name"
                variant="standard"
                onChange={(e) => {
                  setActiveEntry({
                    ...activeEntry,
                    name: e.target.value,
                  });
                  setEdited(true);
                }}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Created By field */}
        {
          activeEntry.createdBy ? (
            <Grid item xs={12}>
              <Typography variant="h5">Created By</Typography>
              <Typography variant="body1">{activeEntry.createdBy}</Typography>
            </Grid>
          ) : null
        }

        {/* Notes field */}
        <Grid item xs={12}>
          <Grid
            container
            direction="row"
            justify="center"
            alignItems="center"
            spacing={2}
          >
            <Grid item>
              <TextField
                id="filled-basic"
                value={activeEntry.notes ? activeEntry.notes : ''}
                disabled={!activeEntryExists}
                label="Notes"
                variant="outlined"
                onChange={(e) => {
                  setActiveEntry({
                    ...activeEntry,
                    notes: e.target.value,
                  });
                  setEdited(true);
                }}
                multiline
                rows={5}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Lat field */}
        <Grid item xs={12}>
          <TextField
            id="filled-basic"
            value={activeEntry.location ? activeEntry.location.latitude : ''}
            disabled={!activeEntryExists}
            label="Latitude"
            variant="standard"
            onChange={(e) => {
              setActiveEntry({
                ...activeEntry,
                location: {
                  ...activeEntry.location,
                  latitude: e.target.value,
                },
              });
              setEdited(true);
            }}
          />
        </Grid>

        {/* Lng field */}
        <Grid item xs={12}>
          <TextField
            id="filled-basic"
            value={activeEntry.location ? activeEntry.location.longitude : ''}
            disabled={!activeEntryExists}
            label="Longitude"
            variant="standard"
            onChange={(e) => {
              setActiveEntry({
                ...activeEntry,
                location: {
                  ...activeEntry.location,
                  longitude: e.target.value,
                },
              });
              setEdited(true);
            }}
          />
        </Grid>

        {/* Address field */}
        {/* TODO make this a search field like the map's */}
        <Grid item xs={12}>
          <TextField
            id="filled-basic"
            value={activeEntry.location ? activeEntry.location.address : ''}
            disabled={!activeEntryExists}
            label="Address"
            variant="standard"
            onChange={(e) => {
              setActiveEntry({
                ...activeEntry,
                location: {
                  ...activeEntry.location,
                  address: e.target.value,
                },
              });
              setEdited(true);
            }}
          />
        </Grid>

        {/* Start time field */}
        <Grid item xs={12}>
          <DateTimeField
            renderInput={(params) => <TextField {...params} />}
            disabled={!activeEntryExists}
            label="Start"
            onChange={(val) => {
              const isoString = val.toISO();
              setActiveEntry({
                ...activeEntry,
                startTimestamp: isoString,
              });
              setEdited(true);
            }}
            value={activeEntry.startTimestamp ? activeEntry.startTimestamp : null}
            maxDateTime={
              activeEntry.endTimestamp
                ? DateTime.fromISO(activeEntry.endTimestamp)
                : null
            }
          />
        </Grid>

        {/* End time field */}
        <Grid item xs={12}>
          <DateTimeField
            renderInput={(params) => <TextField {...params} />}
            disabled={!activeEntryExists}
            label="End"
            onChange={(val) => {
              const isoString = val.toISO();
              setActiveEntry({
                ...activeEntry,
                endTimestamp: isoString,
              });
              setEdited(true);
            }}
            value={activeEntry.endTimestamp ? activeEntry.endTimestamp : null}
            minDateTime={
              activeEntry.startTimestamp
                ? DateTime.fromISO(activeEntry.startTimestamp)
                : null
            }
          />
        </Grid>

        {/* Save and delete buttons */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            disabled={!activeEntryExists}
            startIcon={<SaveIcon />}
            onClick={async () => {
              if (edited) {
                // Make API call
                const updateRes = await updateEntry();
                if (!updateRes) {
                  setSnackbarSeverity('error');
                  setSnackbarMessage('Could not update entry. Please try again later.');
                  setSnackbarOpen(true);
                  return;
                }

                // Update state accordingly
                const newEntries = Array.from(entries);
                const index = newEntries.findIndex((entry) => activeEntry.id === entry.id);
                if (index >= 0) {
                  newEntries[index] = activeEntry;
                  setEntries(newEntries);
                } else {
                  setSnackbarSeverity('error');
                  setSnackbarMessage('The updates were saved, but there was a problem updating the page. Please reload the page for updated information.');
                  setSnackbarOpen(true);
                }
              }
            }}
          >
            Save
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            disabled={!activeEntryExists}
            color="error"
            startIcon={<DeleteIcon />}
            onClick={async () => {
              // Make API call
              const deleteRes = await deleteEntry();
              if (!deleteRes) {
                setSnackbarSeverity('error');
                setSnackbarMessage('Could not delete entry. Please try again later.');
                setSnackbarOpen(true);
                return;
              }

              // Update state accordingly
              const newEntries = Array.from(entries);
              const index = newEntries.findIndex((entry) => activeEntry.id === entry.id);
              if (index >= 0) {
                newEntries.splice(index, 1);
                setEntries(newEntries);
              } else {
                setSnackbarSeverity('error');
                setSnackbarMessage('The entry was deleted, but there was a problem updating the page. Please reload the page for updated information.');
                setSnackbarOpen(true);
              }
            }}
          >
            Delete
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

EntryInfo.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
  setEntries: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  activeEntry: PropTypes.object.isRequired,
  setActiveEntry: PropTypes.func.isRequired,
  updateEntry: PropTypes.func.isRequired,
  deleteEntry: PropTypes.func.isRequired,
  setSnackbarMessage: PropTypes.func,
  setSnackbarSeverity: PropTypes.func,
  setSnackbarOpen: PropTypes.func,
};

EntryInfo.defaultProps = {
  setSnackbarMessage: () => {},
  setSnackbarSeverity: () => {},
  setSnackbarOpen: () => {},
};

export default EntryInfo;
