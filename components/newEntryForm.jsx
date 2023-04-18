import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import Grid from '@mui/material/Grid';
import SaveIcon from '@mui/icons-material/Save';
import TextField from '@mui/material/TextField';
import { DateTime, Settings } from 'luxon';

import DateTimeField from './dateTimeField';
import { debug } from '../utils/config';

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
  const [autocompleteWidget, setAutocompleteWidget] = useState();
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Setup autocomplete
  useEffect(() => {
    if (inputRef.current && !autocompleteWidget) {
      // eslint-disable-next-line no-undef
      const acw = new google.maps.places.Autocomplete(inputRef.current);
      acw.addListener('place_changed', () => {
        const place = acw.getPlace();

        if (!place.geometry || !place.geometry.location) {
          // User entered the name of a Place that was not suggested and
          // pressed the Enter key, or the Place Details request failed.
          // window.alert("No details available for input: '" + place.name + "'");
          return () => {};
        }

        if (debug) {
          console.groupCollapsed('PLACE UPDATE');
          console.log(place);
          console.groupEnd();
        }

        setNewEntryData({
          ...newEntryData,
          name: place.name,
          location: {
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            address: place.formatted_address,
          },
        });
      });
      autocompleteRef.current = acw;
      setAutocompleteWidget(acw);
    }
  }, [inputRef]);

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

        {/* Address field */}
        <Grid item xs={12}>
          <TextField
            inputRef={inputRef}
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
