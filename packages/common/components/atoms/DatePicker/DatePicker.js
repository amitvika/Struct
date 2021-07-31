import React, { useState } from 'react';
import classNames from 'classnames';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';

const DatePicker = ({
  disabled,
  value,
  onChange,
  ...props
}) => {
  const handleDateChange = (date) => {
    onChange(date);
  };

  return (
    <div
      className={classNames('bdb-input')}
    >
      <span className="inp-field-cont">
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            disableToolbar
            variant="inline"
            format="MM/dd/yyyy"
            margin="normal"
            id="date-picker-inline"
            {...props}
            value={value}
            onChange={handleDateChange}
            KeyboardButtonProps={{
              'aria-label': 'change date',
            }}
            style={{ width: '100%' }}
          />
        </MuiPickersUtilsProvider>
      </span>
    </div>

  );
};

export default DatePicker;
