import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import Grid from '@mui/material/Grid';
import SaveIcon from '@mui/icons-material/Save';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import LoadingPage from './loadingPage';

function NewEntryForm({
  entries,
  setEntries,
  newEntryData,
  setNewEntryData,
  createEntry,
}) {
  if (Object.keys(newEntryData).length > 0) {
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
                  value={newEntryData.name}
                  label="Marker Name"
                  variant="outlined"
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
                  id="filled-basic"
                  value={newEntryData.notes}
                  label="Notes"
                  variant="outlined"
                  onChange={(e) => {
                    setNewEntryData({
                      ...newEntryData,
                      notes: e.target.value,
                    });
                  }}
                  multiline
                  rows={10}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Lat field */}
          <Grid item xs={12}>
            <Typography variant="h5">Latitude</Typography>
            <Typography variant="body1">{newEntryData.location ? newEntryData.location.latitude : null}</Typography>
          </Grid>

          {/* Lng field */}
          <Grid item xs={12}>
            <Typography variant="h5">Longitude</Typography>
            <Typography variant="body1">{newEntryData.location ? newEntryData.location.longitude : null}</Typography>
          </Grid>

          {/* Save and delete buttons */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              // className={classes.saveButton}
              startIcon={<SaveIcon />}
              onClick={async () => {
                // Make API call
                const createRes = await createEntry();
                if (!createRes) {
                  // TODO show error
                  return;
                }

                // Update state accordingly
                const newEntries = Array.from(entries);
                newEntries.push(createRes);
                setNewEntryData({});
                setEntries(newEntries);
              }}
            >
              Save
            </Button>

            <Button
              variant="contained"
              // className={classes.deleteButton}
              startIcon={<DeleteIcon />}
              onClick={() => {
                setNewEntryData({})
              }}
            >
              Cancel
            </Button>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return <LoadingPage />;
}

NewEntryForm.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
  setEntries: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  newEntryData: PropTypes.object.isRequired,
  setNewEntryData: PropTypes.func.isRequired,
  createEntry: PropTypes.func.isRequired,
};

export default NewEntryForm;
