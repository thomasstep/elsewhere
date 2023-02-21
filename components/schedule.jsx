import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

import {
  dateTimeMinuteStep,
  debug,
} from '../utils/config';

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
  const timerLabel = 'scheduleAlgo';

  const [days, setDays] = useState([]);
  const [scheduleHeight, setScheduleHeight] = useState(0);
  const [entrySx, setEntrySx] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (entries.length < 1) return;

    if (debug) {
      console.time(timerLabel);
    }

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
    {
      const sorted = validatedEntries.sort((a, b) => {
        // If two events start at the same time, the one with a later end
        //  time goes first
        if (a[startKey].getTime() === b[startKey].getTime()) {
          return b[endKey] - a[endKey];
        }

        return a[startKey] - b[startKey];
      });
      const sortedIds = sorted.map((entry) => entry.id);

      const blockResolution = dateTimeMinuteStep; // minutes, detail to which we calculate overlapping
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

      // Seed matrix
      // TODO figure out how to reduce size of matrix here like what happens in next step
      sortedIds.forEach((entryId, entryIndex) => {
        const blocksFromEarliest = entryMetadata[entryId].msTimeFromEarliest
          / (1000 * 60 * blockResolution);
        const blockDuration = entryMetadata[entryId].msDuration / (1000 * 60 * blockResolution);

        let startingBlock = blocksFromEarliest;
        for (let i = 0; i < blockDuration; i += 1) {
          matrix[startingBlock][entryIndex] = 1;
          startingBlock += 1;
        }

        entryMetadata[entryId].blocksFromEarliest = blocksFromEarliest;
        entryMetadata[entryId].blockDuration = blockDuration;
      });

      // Seed matrix with collision values
      // Reduce size of matrix
      // No duplicate rows after one another
      // No zero rows
      const reducedMatrix = [];
      matrix.forEach((row, i) => {
        // Check to see if we have a duplicate row compared to previous
        if (
          i > 0
          && row.every((val, j) => val === matrix[i - 1][j])
        ) {
          return;
        }

        // Calculate collisions per row
        const collisions = row.reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0,
        );

        // There's nothing on this row and we don't need to keep it
        if (collisions === 0) {
          return;
        }

        // There's only one entry on this row
        if (collisions === 1) {
          reducedMatrix.push(row);
          return;
        }

        // Change each entry's value to collisions in row
        const collisionRow = row.map((entry) => {
          if (entry) {
            return collisions;
          }

          return 0;
        });
        reducedMatrix.push(collisionRow);
      });

      if (debug) {
        console.groupCollapsed('REDUCED MATRIX');
        console.log(reducedMatrix);
        console.groupEnd();
      }

      reducedMatrix.forEach((row) => {
        let position = 0;
        row.forEach((collisions, entryIndex) => {
          const entryId = sortedIds[entryIndex];
          const currentMaxCollisions = entryMetadata[entryId].maxCollisions || 0;
          // When we find the max collisions, set it and position
          if (collisions > currentMaxCollisions) {
            entryMetadata[entryId].maxCollisions = collisions;
            entryMetadata[entryId].position = position;
          }

          // Keep track of how many entries we have already seen
          if (collisions > 0) {
            position += 1;
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
    }

    if (debug) {
      console.groupCollapsed('METADATA AND CALCED SX');
      console.log(entryMetadata);
      console.log(calcedSx);
      console.groupEnd();
    }

    /**
     * Get entry widths and horizontal offsets
     * Second attempt
     * Me no likey but maybe I'll swing back around l8r
     */
    // {
    //   const sorted = validatedEntries.sort((a, b) => {
    //     // If two events start at the same time, the one with a later end
    //     //  time goes first
    //     if (a[startKey].getTime() === b[startKey].getTime()) {
    //       return b[endKey] - a[endKey];
    //     }

    //     return a[startKey] - b[startKey];
    //   });

    //   function calcHorizontal(entries) {
    //     let done = true;
    //     let i = 0;
    //     while (!done) {
    //       const entry = entries[i];
    //       const next = i + 1;

    //       // Check that we aren't at the end and if we have collisions
    //       if (
    //         next < entries.length
    //         && entries[next][startKey] > entry[endKey]
    //       ) {
    //         let maxCollisions = 1; // 1 collision just means itself
    //         let lastEntryStart = 0;
    //         let lastEntryEnd = 0;
    //         let overlapping = true;
    //         let nextOverlap = next;
    //         let subOverlap = [];
    //         let foundEndOfContained = false;
    //         while (overlapping) {
    //           // Check if we are at the end or have found all overlapping entries
    //           if (
    //             nextOverlap >= entries.length
    //             || entries[nextOverlap][startKey] >= entry[endKey]
    //           ) {
    //             overlapping = false;
    //             break;
    //           }

    //           nextOverlappingEntry = entries[nextOverlap];

    //           // No more contained entries
    //           if (nextOverlappingEntry[endKey] > entry[endKey]) {
    //             foundEndOfContained = true;
    //           }

    //           if (!foundEndOfContained) {
    //             // Find contained entries that overlap with each other
    //             if (nextOverlappingEntry[endKey] <= entry[endKey]) {
    //               subOverlap.push(nextOverlappingEntry);
    //             }

    //             // We want to restart the most outer loop at this entry
    //             // Will end up being the first entry not contained
    //             i = nextOverlap + 1;
    //           }

    //           nextOverlap += 1;
    //         }

    //         const width = 100;
    //         calcedSx[entry.id].width = `calc(${width}% - ${spaceBetweenEntries}px)`;
    //         calcedSx[entry.id].left = `calc(${width * metadata.position}% + ${spaceBetweenEntries}px)`;

    //       } else {
    //         // No collisions or at the end; either way, no collisions
    //         i = next;
    //         const width = 100;
    //         calcedSx[entry.id].width = `calc(${width}% - ${spaceBetweenEntries}px)`;
    //         calcedSx[entry.id].left = `calc(${width * metadata.position}% + ${spaceBetweenEntries}px)`;
    //       }

    //       // If we are at the end of the entries, stop
    //       if (i >= entries.length) {
    //         done = false;
    //       }
    //     }

    //     // calcedSx[id].maxCollisions
    //     // calcedSx[id].position
    //   }

    //   calcHorizontal(sorted);

    //   // Add horizontal offsets to calcedSx
    //   const spaceBetweenEntries = 2; // in px
    //   Object.entries(entryMetadata).forEach(([id, metadata]) => {
    //     const width = 100 / metadata.maxCollisions;
    //     calcedSx[id].width = `calc(${width}% - ${spaceBetweenEntries}px)`;
    //     calcedSx[id].left = `calc(${width * metadata.position}% + ${spaceBetweenEntries}px)`;
    //   });
    //   // setEntrySx(calcedSx);
    //   // setLoading(false);
    // }


    if (debug) {
      console.timeEnd(timerLabel);
    }
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
