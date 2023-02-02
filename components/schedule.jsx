import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { LocalConvenienceStoreOutlined } from '@mui/icons-material';


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

  for(let i = 1; i < daysBetween + 1; i++) {
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
  if (entries.length > 0) {
    const sortedEntries = entries.sort((a, b) => a[startKey] - b[endKey]);
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

    // Get px heights
    const days = getDateRange(earliestEntry[startKey], latestEntry[endKey]);
    const hours = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
    const dateHeight = 40; // In px
    const hourHeight = 40; // In px
    const minuteHeight = hourHeight / 60;
    // One height unit for each hour per day plus on height unit for each day
    const scheduleHeight = (days.length) * 25 * hourHeight;

    // Get entry px heights and offsets
    const entryOffsets = {};
    const earliestDay = new Date(Date.UTC(earliestEntry[startKey].getUTCFullYear(), earliestEntry[startKey].getUTCMonth(), earliestEntry[startKey].getUTCDate()));
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

      entryOffsets[entry.id] = {
        top: `${topOffset}px`,
        height: `${height}px`,
      };
      console.log(`ID: ${entry.id}; minDuration: ${msDuration / (1000 * 60)}; minute tfe: ${msTimeFromEarliest / (1000 * 60)}; days fe: ${endDaysFromEarliest}`)
    });
    console.log(entryOffsets);

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
          {days.map((day) => {
            return (
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
                {hours.map((hour) => {
                  return (
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
                  );
                })}
              </>
            );
          })}
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
            {entries.map((entry) => {
              return (
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
              );
            })}
          </Grid>
        </Grid>
      </Box>
    )
  }

  return null;
}

Schedule.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
  startKey: PropTypes.string,
  endKey: PropTypes.string,
};

export default Schedule;
