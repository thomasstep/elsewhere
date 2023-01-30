import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import Grid from '@mui/material/Grid';
import SaveIcon from '@mui/icons-material/Save';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import LoadingPage from './loadingPage';

function EntryInfo({
  entries,
  setEntries,
  activeEntry,
  setActiveEntry,
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
                  value={activeEntry.name}
                  label="Marker Name"
                  variant="outlined"
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
                  value={activeEntry.notes}
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
                  rowsMax={10}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Lat field */}
          <Grid item xs={12}>
            <Typography variant="h5">Latitude</Typography>
            <Typography variant="body1">{activeEntry.location ? activeEntry.location.latitude : null}</Typography>
          </Grid>

          {/* Lng field */}
          <Grid item xs={12}>
            <Typography variant="h5">Longitude</Typography>
            <Typography variant="body1">{activeEntry.location ? activeEntry.location.longitude : null}</Typography>
          </Grid>

          {/* Save and delete buttons */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              // className={classes.saveButton}
              startIcon={<SaveIcon />}
              onClick={() => {
                if (!edited) {

                } else {
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
              onClick={() => {
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
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
  setEntries: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  activeEntry: PropTypes.object.isRequired,
  setActiveEntry: PropTypes.func.isRequired,
};

export default EntryInfo;
