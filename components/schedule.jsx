import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';


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
      if (entry[endKey] < latestEntry[endKey]) {
        latestEntry = entry;
      }
    });
    const days = getDateRange(earliestEntry[startKey], latestEntry[endKey]);
    const hours = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
    const hourHeight = 40; // In px
    // One height unit for each hour per day plus on height unit for each day
    const scheduleHeight = (days.length + 1) * 25 * hourHeight;
    console.log(scheduleHeight)

    return (
      <Box
      sx={{
        position: 'relative',
      }}
      >
        {/*
          The grid has two layers, a standard time layer and a schedule layer.
          The standard layer contains the days split up by hour.
          The schedule layer is a single grid item that uses boxes
            and absolute positioning to overlay entries in their appropriate
            time slots.
        */}
        <Grid
          container
          direction="row"
          justifyContent="flex-start"
          alignItems="flex-start"
          sx={{
            position: 'absolute'
          }}
        >
          {
            days.map((day) => {
              return (
                <>
                  <Grid
                    key={day}
                    item
                    xl={12}
                    sx={{
                      height: `${hourHeight}px`,
                      'border-style': 'solid',
                      'border-width': '1px',
                    }}
                  >
                    <Grid
                      container
                      direction="row"
                    >
                      <Grid item xl={1}>
                        {day}
                      </Grid>
                    </Grid>
                  </Grid>
                  {hours.map((hour) => {
                    console.log(`${day}T${hour}`)
                    return (
                      <Grid
                        key={`${day}T${hour}`}
                        item
                        xl={12}
                        sx={{
                          height: `${hourHeight}px`,
                          'border-style': 'solid',
                          'border-width': '1px',
                        }}
                      >
                        <Grid
                          container
                          direction="row"
                        >
                          <Grid item xl={1}>
                            {hour}
                          </Grid>
                        </Grid>
                      </Grid>
                    );
                  })}
                </>
              );
            })
          }
        </Grid>
        <Grid
          container
          direction="row"
          justifyContent="flex-start"
          alignItems="flex-start"
          sx={{
            position: 'absolute',
            height: `${scheduleHeight}px`,
          }}
        >
          {/*
           */}
          <Grid item xl={1} />
          <Grid
            item
            xl={11}
            sx={{
              height: '100%',
              'border-style': 'solid',
            }}
          >
            howdy
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
