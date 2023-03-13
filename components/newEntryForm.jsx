import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import Grid from '@mui/material/Grid';
import SaveIcon from '@mui/icons-material/Save';
import TextField from '@mui/material/TextField';
import { DateTime, Settings } from 'luxon';

import DateTimeField from './dateTimeField';

Settings.defaultZone = 'utc';

function NewEntryForm({
  entries,
  setEntries,
  newEntryData,
  setNewEntryData,
  createEntry,
  setSnackbarMessage,
  setSnackbarSeverity,
  setSnackbarOpen,
}) {
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
                value={newEntryData.name || ''}
                label="Name"
                variant="standard"
                onChange={(e) => {
                  setNewEntryData({
                    ...newEntryData,
                    name: e.target.value,
                  });
                }}
              />
            </Grid>
          </Grid>
        </Grid>

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
                value={newEntryData.notes || ''}
                label="Notes"
                variant="standard"
                onChange={(e) => {
                  setNewEntryData({
                    ...newEntryData,
                    notes: e.target.value,
                  });
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
            value={newEntryData?.location?.latitude ? newEntryData.location.latitude : ''}
            label="Latitude"
            variant="standard"
            onChange={(e) => {
              setNewEntryData({
                ...newEntryData,
                location: {
                  ...newEntryData.location,
                  latitude: parseFloat(e.target.value),
                },
              });
            }}
          />
        </Grid>

        {/* Lng field */}
        <Grid item xs={12}>
          <TextField
            value={newEntryData?.location?.longitude ? newEntryData.location.longitude : ''}
            label="Longitude"
            variant="standard"
            onChange={(e) => {
              setNewEntryData({
                ...newEntryData,
                location: {
                  ...newEntryData.location,
                  longitude: parseFloat(e.target.value),
                },
              });
            }}
          />
        </Grid>

        {/* Address field */}
        {/* TODO make this a search field like the map's */}
        <Grid item xs={12}>
          <TextField
            value={newEntryData?.location?.address ? newEntryData.location.address : ''}
            label="Address"
            variant="standard"
            onChange={(e) => {
              setNewEntryData({
                ...newEntryData,
                location: {
                  ...newEntryData.location,
                  address: e.target.value,
                },
              });
            }}
          />
        </Grid>

        {/* Start time field */}
        <Grid item xs={12}>
          <DateTimeField
            renderInput={(params) => <TextField {...params} />}
            label="Start"
            onChange={(val) => {
              const isoString = val.toISO();
              setNewEntryData({
                ...newEntryData,
                startTimestamp: isoString,
              });
            }}
            value={newEntryData.startTimestamp ? newEntryData.startTimestamp : null}
            maxDateTime={
              newEntryData.endTimestamp
                ? DateTime.fromISO(newEntryData.endTimestamp)
                : null
            }
          />
        </Grid>

        {/* End time field */}
        <Grid item xs={12}>
          <DateTimeField
            renderInput={(params) => <TextField {...params} />}
            label="End"
            onChange={(val) => {
              const isoString = val.toISO();
              setNewEntryData({
                ...newEntryData,
                endTimestamp: isoString,
              });
            }}
            value={newEntryData.endTimestamp ? newEntryData.endTimestamp : null}
            minDateTime={
              newEntryData.startTimestamp
                ? DateTime.fromISO(newEntryData.startTimestamp)
                : null
            }
          />
        </Grid>

        {/* Save and delete buttons */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={async () => {
              // Make API call
              const createRes = await createEntry();
              if (!createRes) {
                setSnackbarSeverity('error');
                setSnackbarMessage('Could not save entry. Please try again later.');
                setSnackbarOpen(true);
                return;
              }

              // Update state accordingly
              const newEntries = Array.from(entries);
              newEntries.push(createRes);
              setNewEntryData({});
              setEntries(newEntries);
            }}
          >
            Create
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              setNewEntryData({});
            }}
          >
            Clear
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

NewEntryForm.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
  setEntries: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  newEntryData: PropTypes.object.isRequired,
  setNewEntryData: PropTypes.func.isRequired,
  createEntry: PropTypes.func.isRequired,
  setSnackbarMessage: PropTypes.func,
  setSnackbarSeverity: PropTypes.func,
  setSnackbarOpen: PropTypes.func,
};

NewEntryForm.defaultProps = {
  setSnackbarMessage: () => {},
  setSnackbarSeverity: () => {},
  setSnackbarOpen: () => {},
};

export default NewEntryForm;
