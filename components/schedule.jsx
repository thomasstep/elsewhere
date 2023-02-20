import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

// import {
//   debug,
// } from '../utils/config';

function formatDate(date) {
  return new Intl.DateTimeFormat('en', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function getDateRange(startTs, endTs) {
  const startDate = new Date(startTs.getUTCFullYear(), startTs.getUTCMonth(), startTs.getUTCDate());
  const endDate = new Date(endTs.getUTCFullYear(), endTs.getUTCMonth(), endTs.getUTCDate());

  const oneDayInMs = (1000 * 60 * 60 * 24);
  const daysBetween = ((endDate - startDate) / oneDayInMs);

  const dates = [formatDate(startDate)];

  for (let i = 1; i < daysBetween + 1; i += 1) {
    startDate.setDate(startDate.getDate() + 1);
    // Since setDays is what is directly rendered
    //   getDateRange needs to produce the correct text
    dates.push(formatDate(startDate));
  }

  return dates;
}

function Schedule({
  entries,
  activeEntry,
  startKey,
  endKey,
  entryOnClick,
}) {
  // Date constitutes as midnight/00:00 in the time layer
  const hours = [
    '01:00',
    '02:00',
    '03:00',
    '04:00',
    '05:00',
    '06:00',
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00'];
  const hourHeight = 40; // In px
  const minuteHeight = hourHeight / 60;

  const [days, setDays] = useState([]);
  const [scheduleHeight, setScheduleHeight] = useState(0);
  const [entrySx, setEntrySx] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (entries.length < 1) return;

    const calcedSx = {};

    /**
     * Get the earliest and latest of all entries
     * Also validate entries
    */
    const validatedEntries = [];
    let earliestEntry = entries[0];
    let latestEntry = entries[0];
    entries.forEach((entry) => {
      if (entry[startKey] > entry[endKey]) {
        return;
      }
      validatedEntries.push(entry);

      if (entry[startKey] < earliestEntry[startKey]) {
        earliestEntry = entry;
      }

      if (entry[endKey] > latestEntry[endKey]) {
        latestEntry = entry;
      }

      // Initialize sx for each valid entry
      calcedSx[entry.id] = {};

      // Fade everything that is not the active entry
      if (activeEntry.id) {
        if (entry.id !== activeEntry.id) {
          calcedSx[entry.id].opacity = '0.60';
        }
      }
    });
    if (validatedEntries.length < 1) return;

    const entryMetadata = {};

    // Get px heights
    // Since setDays is what is directly rendered
    //   getDateRange needs to produce the correct text
    const dateRange = getDateRange(earliestEntry[startKey], latestEntry[endKey]);
    setDays(dateRange);
    // One height unit for each hour per day
    const schHeight = (dateRange.length) * 24 * hourHeight;
    setScheduleHeight(schHeight);

    /**
     * Get entry px heights and vertical offsets
     */
    const earliestDay = new Date(
      Date.UTC(
        earliestEntry[startKey].getUTCFullYear(),
        earliestEntry[startKey].getUTCMonth(),
        earliestEntry[startKey].getUTCDate(),
      ),
    );
    validatedEntries.forEach((entry) => {
      // const startDaysFromEarliest = getDateRange(earliestDay, entry[startKey]).length;
      // const endDaysFromEarliest = getDateRange(earliestDay, entry[endKey]).length;
      const msDuration = entry[endKey].getTime() - entry[startKey].getTime();
      let height = 0;
      // Calculate height of dates passed
      // Currently disabled because date is midnight
      // If an entry is less than one day in length,
      //  we do not need to compensate
      // height += (endDaysFromEarliest - startDaysFromEarliest) * dateHeight;

      height += (msDuration / (1000 * 60)) * minuteHeight;
      // Check that end time is not before start time
      if (height < 0) {
        height = 0;
      }

      const msTimeFromEarliest = entry[startKey].getTime() - earliestDay.getTime();
      let topOffset = 0;

      // Calculate offset for dates
      // Currently disabled because date is midnight
      // Everything will have at least 1 dateHeight of offset
      //  because the first row on the schedule is the earliest date
      // topOffset += startDaysFromEarliest * dateHeight;

      // Calculate minutes from earliest, then multiply by minute height
      topOffset += (msTimeFromEarliest / (1000 * 60)) * minuteHeight;

      // Add to metadata cache for use in horizontal calculations
      entryMetadata[entry.id] = {
        msTimeFromEarliest,
        msDuration,
      };

      calcedSx[entry.id].top = `${topOffset}px`;
      calcedSx[entry.id].height = `${height}px`;
    });

    /**
     * Get entry widths and horizontal offsets
     * TODO this whole piece of the operation could use some optimization ASAP
     */
    const sorted = validatedEntries.sort((a, b) => {
      // If two events start at the same time, the one with a later start
      //  time goes first
      if (a[startKey].getTime() === b[startKey].getTime()) {
        return b[endKey] - a[endKey];
      }

      return a[startKey] - b[startKey];
    });
    const sortedIds = sorted.map((entry) => entry.id);

    const blockResolution = 5; // minutes, detail to which we calculate overlapping
    const blocksPerDay = (24 * 60) / blockResolution;
    const totalBlocks = blocksPerDay * dateRange.length;
    const entryLength = validatedEntries.length;
    const columns = [];
    for (let i = 0; i < entryLength; i += 1) {
      columns.push(0);
    }

    let matrix = [];
    for (let i = 0; i < totalBlocks; i += 1) {
      matrix.push(Array.from(columns));
    }

    // if (debug) {
    //   console.groupCollapsed('MATRIX INIT');
    //   console.log(matrix);
    //   console.groupEnd();
    // }

    // Seed matrix
    sortedIds.forEach((entryId, entryIndex) => {
      const blocksFromEarliest = entryMetadata[entryId].msTimeFromEarliest
        / (1000 * 60 * blockResolution);
      const blockDuration = entryMetadata[entryId].msDuration / (1000 * 60 * blockResolution);
      // if (debug) {
      //   console.groupCollapsed(`SEED MATRIX ${entryId}`);
      //   console.log(entryMetadata[entryId]);
      //   console.log(blocksFromEarliest);
      //   console.log(blockDuration);
      //   console.groupEnd();
      // }

      let startingBlock = blocksFromEarliest;
      for (let i = 0; i < blockDuration; i += 1) {
        matrix[startingBlock][entryIndex] = 1;
        startingBlock += 1;
      }

      entryMetadata[entryId].blocksFromEarliest = blocksFromEarliest;
      entryMetadata[entryId].blockDuration = blockDuration;
    });
    // Seed matrix with collision values
    matrix = matrix.map((row) => {
      // Calculate collisions per row
      const collisions = row.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0,
      );
      // Change each entry's value to collisions in row
      return row.map((entry) => {
        if (entry) {
          return collisions;
        }
        return 0;
      });
    });
    // Find max collisions per entry; 1 means no collisions
    sorted.forEach((entry, entryIndex) => {
      const {
        blocksFromEarliest,
        blockDuration,
      } = entryMetadata[entry.id];
      let maxCollisions = 1;
      let startingBlock = blocksFromEarliest;
      for (let i = 0; i < blockDuration; i += 1) {
        const collisions = matrix[startingBlock][entryIndex];
        if (collisions > maxCollisions) {
          maxCollisions = collisions;
        }
        startingBlock += 1;
      }
      entryMetadata[entry.id].maxCollisions = maxCollisions;
    });
    // Determine position relative to overlaps
    matrix.forEach((row) => {
      // Check if row contains an entry's max collisions and note its position
      let position = 0;
      row.forEach((collisions, entryIndex) => {
        if (collisions === entryMetadata[sortedIds[entryIndex]].maxCollisions) {
          // If the overlap already has a position don't give it a new one,
          //  but push the position for subsequent entries
          const currentPositionDefined = entryMetadata[sortedIds[entryIndex]].position;
          if (currentPositionDefined) {
            position = currentPositionDefined + 1;
          } else {
            entryMetadata[sortedIds[entryIndex]].position = position;
            position += 1;
          }
        }
      });
    });
    // Add horizontal offsets to calcedSx
    const spaceBetweenEntries = 2; // in px
    Object.entries(entryMetadata).forEach(([id, metadata]) => {
      const width = 100 / metadata.maxCollisions;
      calcedSx[id].width = `calc(${width}% - ${spaceBetweenEntries}px)`;
      calcedSx[id].left = `calc(${width * metadata.position}% + ${spaceBetweenEntries}px)`;
    });

    setEntrySx(calcedSx);
    setLoading(false);
  }, [entries]);

  if (loading) {
    return (
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: '100vh' }}
      >
        <Grid item xs={2}>
          <CircularProgress />
        </Grid>
      </Grid>
    );
  }

  if (entries.length > 0) {
    const dividerStyle = {
      position: 'absolute',
      width: '100%',
      // Body's line height is 1.5rem
      // This offsets the "divider with text" enough to
      //   line up with the top of the grid item
      top: '-0.75rem',
    };

    return (
      <Box
        sx={{
          position: 'relative',
          height: '100vh',
          overflow: 'hidden',
          overflowY: 'scroll',
          // Offset the top of the box for the first divider
          paddingTop: '0.75rem',
        }}
      >
        {/*
          The component has two layers,
            a standard time layer and a schedule layer.
          The time layer contains the days split up by hour.
          The schedule layer is a single grid item that uses boxes
            and absolute positioning to overlay entries in their appropriate
            time slots.
          Both layers are absolutely positioned grids to make sure they
            will line up. The dates and times are given the leftmost
            column, one column wide. The events are given the remaining
            eleven columns of leeway and of course as many rows as needed.
        */}

        {/* Time layer grid */}
        <Grid
          container
          direction="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          sx={{
            width: '100%',
            position: 'absolute',
          }}
        >
          {days.map((day) => (
            <React.Fragment
              key={day}
            >
              <Grid
                item
                xs={12}
                sx={{
                  width: '100%',
                }}
              >
                <Grid
                  container
                  direction="row"
                >
                  <Grid
                    item
                    xs={12}
                    sx={{
                      height: `${hourHeight}px`,
                      position: 'relative',
                    }}
                  >
                    <Divider
                      textAlign="left"
                      variant="fullWidth"
                      sx={dividerStyle}
                    >
                      {day}
                    </Divider>
                  </Grid>
                </Grid>
              </Grid>
              {hours.map((hour) => (
                <Grid
                  key={`${day}T${hour}`}
                  item
                  xs={12}
                  sx={{
                    height: `${hourHeight}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  <Grid
                    container
                    direction="row"
                  >
                    <Grid
                      item
                      xs={12}
                      sx={{
                        height: `${hourHeight}px`,
                        position: 'relative',
                      }}
                    >
                      <Divider
                        textAlign="left"
                        variant="fullWidth"
                        sx={dividerStyle}
                      >
                        {hour}
                      </Divider>
                    </Grid>
                  </Grid>
                </Grid>
              ))}
            </React.Fragment>
          ))}
        </Grid>

        {/* Schedule layer grid */}
        <Grid
          container
          direction="row"
          justifyContent="flex-start"
          alignItems="flex-start"
          sx={{
            width: '100%',
            height: `${scheduleHeight}px`,
            position: 'absolute',
          }}
        >
          <Grid
            item
            xs={2}
            sm={1}
          />
          <Grid
            item
            xs={10}
            sm={11}
            sx={{
              position: 'relative',
            }}
          >
            {entries.map((entry) => (
              <Paper
                key={entry.id}
                onClick={(e) => entryOnClick(e, entry)}
                sx={{
                  position: 'absolute',
                  bgcolor: 'primary.main',
                  p: 1,
                  ...entrySx[entry.id],
                }}
              >
                {entry.name || 'No name'}
              </Paper>
            ))}
          </Grid>
        </Grid>
      </Box>
    );
  }

  // TODO saying something about creating a new entry with times
  return null;
}

Schedule.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  activeEntry: PropTypes.object,
  startKey: PropTypes.string,
  endKey: PropTypes.string,
  entryOnClick: PropTypes.func,
};

Schedule.defaultProps = {
  activeEntry: {},
  startKey: 'start',
  endKey: 'end',
  entryOnClick: () => {},
};

export default Schedule;
