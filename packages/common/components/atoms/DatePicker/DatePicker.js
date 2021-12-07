import React, { useState } from 'react';
import classNames from 'classnames';
// import AdapterDateFns from '@mui/lab/AdapterDateFns';
// import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';

const DatePickerComp = ({ disabled, value, onChange, ...props }) => {
  const handleDateChange = (date) => {
    onChange(date);
  };

  return (
    <div className={classNames('bdb-input')}>
      <span className="inp-field-cont">
        {/* <LocalizationProvider dateAdapter={AdapterDateFns}> */}
        <DatePicker
          disableToolbar
          variant="inline"
          format="MM/dd/yyyy"
          margin="normal"
          id="date-picker-inline"
          {...props}
          value={value}
          onChange={handleDateChange}
          KeyboardButtonProps={{
            'aria-label': 'change date'
          }}
          style={{ width: '100%' }}
        />
        {/* </LocalizationProvider> */}
      </span>
    </div>
  );
};

export default DatePickerComp;
