import React from 'react'
import MuiPickersUtilsProvider from "@material-ui/pickers/MuiPickersUtilsProvider";
import DatePicker from "@material-ui/pickers/DatePicker";

import DateFnsUtils from "@date-io/date-fns";

export default function DatePickerForMT(props) {
    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}
            locale={props.dateTimePickerLocalization}>
            <DatePicker
                format="dd/MM/yyyy"
                value={props.value || new Date()}
                onChange={props.onChange}
                clearable
                InputProps={{
                    style: {
                        fontSize: 13,
                    }
                }}
            />
        </MuiPickersUtilsProvider>
    )
}
