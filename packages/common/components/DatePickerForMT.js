import React from 'react';

// import AdapterDateFns from '@mui/lab/AdapterDateFns';
// import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';

export default function DatePickerForMT(props) {
  return (
    // <LocalizationProvider
    //   dateAdapter={AdapterDateFns}
    //   locale={props.dateTimePickerLocalization}
    // >
    <DatePicker
      format="dd/MM/yyyy"
      value={props.value || new Date()}
      onChange={props.onChange}
      clearable
      InputProps={{
        style: {
          fontSize: 13
        }
      }}
    />
    // </LocalizationProvider>
  );
}
