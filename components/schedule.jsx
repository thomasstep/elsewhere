import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';


function getDateFromISOString(isoString) {
  const [date] = isoString.split('T');
  return date;
}

function getDateRange(startTs, endTs) {
  const startDate = new Date(startTs.getUTCFullYear(), startTs.getUTCMonth(), startTs.getUTCDate());
  const endDate = new Date(endTs.getUTCFullYear(), endTs.getUTCMonth(), endTs.getUTCDate());

  const oneDayInMs = (1000 * 60 * 60 * 24);
  const daysBetween = ((endDate - startDate) / oneDayInMs);

  const dates = [getDateFromISOString(startDate.toISOString())];

  for (let i = 1; i < daysBetween + 1; i += 1) {
    startDate.setDate(startDate.getDate() + 1);
    dates.push(getDateFromISOString(startDate.toISOString()));
  }

  return dates;
}

function Schedule({
  entries,
  startKey = 'start',
  endKey = 'end',
}) {
  const hours = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
  const dateHeight = 40; // In px
  const hourHeight = 40; // In px
  const minuteHeight = hourHeight / 60;

  const [days, setDays] = useState([]);
  const [scheduleHeight, setScheduleHeight] = useState(0);
  const [entryOffsets, setEntryOffsets] = useState({});

  useEffect(() => {
    if (entries.length < 1) return;

    /**
     * Get the earliest and latest of all entries
     */
    let earliestEntry = entries[0];
    let latestEntry = entries[0];
    entries.forEach((entry) => {
      if (entry[startKey] < earliestEntry[startKey]) {
        earliestEntry = entry;
      }

      if (entry[endKey] > latestEntry[endKey]) {
        latestEntry = entry;
      }
    });

    const entryMetadata = {};

    // Get px heights
    const dateRange = getDateRange(earliestEntry[startKey], latestEntry[endKey]);
    setDays(dateRange);
    // One height unit for each hour per day plus on height unit for each day
    const schHeight = (days.length) * 25 * hourHeight;
    setScheduleHeight(schHeight);

    /**
     * Get entry px heights and vertical offsets
     */
    const calcedOffsets = {};
    const earliestDay = new Date(
      Date.UTC(
        earliestEntry[startKey].getUTCFullYear(),
        earliestEntry[startKey].getUTCMonth(),
        earliestEntry[startKey].getUTCDate(),
      ),
    );
    entries.forEach((entry) => {
      const startDaysFromEarliest = getDateRange(earliestDay, entry[startKey]).length;
      const endDaysFromEarliest = getDateRange(earliestDay, entry[endKey]).length;
      const msDuration = entry[endKey].getTime() - entry[startKey].getTime();
      let height = 0;
      // Calculate height of dates passed
      // If an entry is less than one day in length,
      //  we do not need to compensate
      height += (endDaysFromEarliest - startDaysFromEarliest) * dateHeight;
      height += (msDuration / (1000 * 60)) * minuteHeight;

      const msTimeFromEarliest = entry[startKey].getTime() - earliestDay.getTime();
      let topOffset = 0;
      // Calculate offset for dates
      // Everything will have at least 1 dateHeight of offset
      //  because the first row on the schedule is the earliest date
      topOffset += startDaysFromEarliest * dateHeight;
      // Calculate minutes from earliest, then multiply by minute height
      topOffset += (msTimeFromEarliest / (1000 * 60)) * minuteHeight;

      // Add to metadata cache for use in horizontal calculations
      entryMetadata[entry.id] = {
        msTimeFromEarliest,
        msDuration,
      };

      calcedOffsets[entry.id] = {
        top: `${topOffset}px`,
        height: `${height}px`,
      };
    });

    /**
     * Get entry widths and horizontal offsets
     * TODO this whole piece of the operation could use some optimization
     */
    const sorted = entries.sort((a, b) => {
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
    const totalBlocks = blocksPerDay * days.length;
    const entryLength = entries.length;
    const columns = [];
    for (let i = 0; i < entryLength; i += 1) {
      columns.push(0);
    }

    let matrix = [];
    for (let i = 0; i < totalBlocks; i += 1) {
      matrix.push(Array.from(columns));
    }

    // Seed matrix
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
    // Add horizontal offsets to calcedOffsets
    Object.entries(entryMetadata).forEach(([id, metadata]) => {
      const width = 100 / metadata.maxCollisions;
      calcedOffsets[id].width = `${width}%`;
      calcedOffsets[id].left = `calc(${width * metadata.position}% + 0px)`;
    });

    setEntryOffsets(calcedOffsets);
  }, [entries.length]);

  if (entries.length > 0) {
    return (
      <Box
        sx={{
          position: 'relative',
        }}
      >
        {/*
          The component has two layers,
            a standard time layer and a schedule layer.
          The standard layer contains the days split up by hour.
          The schedule layer is a single grid item that uses boxes
            and absolute positioning to overlay entries in their appropriate
            time slots.
          Both layers are absolutely positioned grids to make sure they
            will line up. The dates and times are given the leftmost
            column, one column wide. The events are given the remaining
            eleven columns of leeway and of course as many rows as needed.
        */}

        {/* Standard layer grid */}
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
            <>
              <Grid
                key={day}
                item
                xl={12}
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
                    xl={1}
                    sx={{
                      height: `${dateHeight}px`,
                    }}
                  >
                    {day}
                  </Grid>
                </Grid>
              </Grid>
              {hours.map((hour) => (
                <Grid
                  key={`${day}T${hour}`}
                  item
                  xl={12}
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
                      xl={1}
                      sx={{
                        height: `${hourHeight}px`,
                        'border-width': '1px',
                        'border-style': 'solid',
                      }}
                    >
                      {hour}
                    </Grid>
                  </Grid>
                </Grid>
              ))}
            </>
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
            xl={1}
          />
          <Grid
            item
            xl={11}
            sx={{
              position: 'relative',
            }}
          >
            {entries.map((entry) => (
              <Box
                sx={{
                  'border-style': 'solid',
                  position: 'absolute',
                  left: '80px',
                  ...entryOffsets[entry.id],
                }}
              >
                {entry.name || 'No name'}
              </Box>
            ))}
          </Grid>
        </Grid>
      </Box>
    );
  }

  return null;
}

Schedule.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
  startKey: PropTypes.string,
  endKey: PropTypes.string,
};

Schedule.defaultProps = {
  startKey: 'start',
  endKey: 'end',
};

export default Schedule;
