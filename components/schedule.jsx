import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

import {
  debug,
  hourHeight,
} from '../utils/config';

const dividerStyle = {
  position: 'absolute',
  width: '100%',
  // Body's line height is 1.5rem
  // This offsets the "divider with text" enough to
  //   line up with the top of the grid item
  top: '-0.75rem',
};

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

function DayHours() {
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

  return (
    <>
      {hours.map((hour) => (
        <Grid
          key={`${hour}`}
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
    </>
  );
}

function Schedule({
  entries,
  activeEntry,
  startKey,
  endKey,
  entryOnClick,
}) {
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

      // Given entry length n, make an nxn matrix
      const entryLength = validatedEntries.length;
      const columns = [];
      for (let i = 0; i < entryLength; i += 1) {
        columns.push(0);
      }

      let matrix = [];
      for (let i = 0; i < entryLength; i += 1) {
        matrix.push(Array.from(columns));
      }

      // Seed matrix
      sorted.forEach((entry, i) => {
        matrix[i][i] = 1;
        for (let j = i + 1; j < sortedIds.length; j += 1) {
          // If there is an overlap, then mark the current entry
          //   in the overlapping space
          // When we no longer find overlaps, end
          if (entry[endKey] > sorted[j][startKey]) {
            matrix[j][i] = 1;
          } else {
            break;
          }
        }
      });

      if (debug) {
        console.groupCollapsed('SEED MATRIX');
        console.log(matrix);
        console.groupEnd();
      }

      // Populate matrix with collision values
      matrix = matrix.map((row) => {
        // Calculate collisions per row
        const collisions = row.reduce(
          (accumulator, currentValue) => accumulator + currentValue,
          0,
        );

        // There's only one entry on this row
        if (collisions === 1) {
          return row;
        }

        // Change each entry's value to collisions in row
        return row.map((entry) => {
          if (entry) {
            return collisions;
          }

          return 0;
        });
      });

      if (debug) {
        console.groupCollapsed('COLLISION MATRIX');
        console.log(matrix);
        console.groupEnd();
      }

      matrix.forEach((row) => {
        let position = 0;
        row.forEach((collisions, entryIndex) => {
          const entryId = sortedIds[entryIndex];
          const currentMaxCollisions = entryMetadata[entryId].maxCollisions || 0;
          // When we find the max collisions, set it and entry's position
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
              <DayHours />
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
