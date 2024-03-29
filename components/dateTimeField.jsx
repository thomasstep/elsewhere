import * as React from 'react';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Settings } from 'luxon';

Settings.defaultZone = 'utc';

function DateTimeField({
  ...props
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <DateTimePicker
        {...props}
      />
    </LocalizationProvider>
  );
}

export default DateTimeField;
