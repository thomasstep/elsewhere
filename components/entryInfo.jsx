import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import Grid from '@mui/material/Grid';
import SaveIcon from '@mui/icons-material/Save';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DateTime, Settings } from "luxon";

import LoadingPage from './loadingPage';
import DateTimeField from './dateTimeField';

Settings.defaultZone = 'utc';

function EntryInfo({
  entries,
  setEntries,
  activeEntry,
  setActiveEntry,
  updateEntry,
  deleteEntry,
}) {
  // Boolean tells whether the entry has been edited
  const [edited, setEdited] = useState(false);

  if (activeEntry.id) {
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
                  label="Notes"
                  variant="standard"
                  onChange={(e) => {
                    setActiveEntry({
                      ...activeEntry,
                      notes: e.target.value,
                    });
                    setEdited(true);
                  }}
                  multiline
                  rows={10}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Lat field */}
          <Grid item xs={12}>
            <TextField
              id="filled-basic"
              value={activeEntry.location ? activeEntry.location.latitude : ''}
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
          <Grid item xs={12}>
            <TextField
              id="filled-basic"
              value={activeEntry.location ? activeEntry.location.address : ''}
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
              maxDateTime={activeEntry.endTimestamp ? DateTime.fromISO(activeEntry.endTimestamp) : null}
            />
          </Grid>

          {/* End time field */}
          <Grid item xs={12}>
            <DateTimeField
              renderInput={(params) => <TextField {...params} />}
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
              minDateTime={activeEntry.startTimestamp ? DateTime.fromISO(activeEntry.startTimestamp) : null}
            />
          </Grid>

          {/* Save and delete buttons */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              // className={classes.saveButton}
              startIcon={<SaveIcon />}
              onClick={async () => {
                if (edited) {
                  // Make API call
                  const updateRes = await updateEntry();
                  if (!updateRes) {
                    // TODO show error
                    return;
                  }

                  // Update state accordingly
                  const newEntries = Array.from(entries);
                  const index = newEntries.findIndex((entry) => activeEntry.id === entry.id);
                  if (index >= 0) {
                    newEntries[index] = activeEntry;
                    setEntries(newEntries);
                  } else {
                    // TODO show error because entry was not found
                  }
                }
              }}
            >
              Save
            </Button>

            <Button
              variant="contained"
              // className={classes.deleteButton}
              startIcon={<DeleteIcon />}
              onClick={async () => {
                // Make API call
                const deleteRes = await deleteEntry();
                if (!deleteRes) {
                  // TODO show error
                  return;
                }

                // Update state accordingly
                const newEntries = Array.from(entries);
                const index = newEntries.findIndex((entry) => activeEntry.id === entry.id);
                if (index >= 0) {
                  newEntries.splice(index, 1);
                  setEntries(newEntries);
                } else {
                  // TODO show error because entry was not found
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

  // TODO make this an error page
  return <LoadingPage />;
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
};

export default EntryInfo;
