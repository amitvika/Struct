import React from 'react';
import _ from 'lodash';
import { array, shape, string, func, number, oneOfType } from 'prop-types';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText'; 
//import Grid from '@mui/material/Grid';

const getName = (name) => _.replace(name, /\./g, ' ');

const getRenderValue = (selected, items, multiple) => {
  console.log(selected);
  let myvalue = selected? selected.target ? selected.target.value : selected : '';
  if (!multiple)  {
    let myItem = items.find((item) => item.value === myvalue );
    if(myItem) {
      return myItem.title;
    }
    return "";
  }

  return items
    .reduce((result, item) => {
      if(item) {
        if (myvalue.includes(item.value)) {
          result.push(item.title);
        }
      }      
      return result;
    }, [])
    .join(', ');
};

const CustomSelect = ({ field, selectedValues, errors, onChange, labelwidth, ...others }) => {
  const key = field.key || field.name || 'key';
  const inputKey = `form-${key}`;
  const name = field.name || 'field';
  const disabled = field.disabled || false;
  const multiple = field.multiple || false;
  const helperText = field.helperText || '';
  const empty = field.empty || false;
  let errorText = _.get(errors, key, false);
  const items = field.items || [];
  let currentlabelwidth = labelwidth || 0;
  currentlabelwidth = 0;
  const textwidth = 100-currentlabelwidth;
  currentlabelwidth = textwidth;
  let myvalues = selectedValues? selectedValues.target ? selectedValues.target.value : selectedValues : '';
 
 
  console.log("Selected Values",selectedValues,"Common Baby");
  return (
    <FormControl style={{ width: '100%' }} error={!!errorText}>
       {/* <Grid style={{display:"flex"}}> */}
        <span >
        {currentlabelwidth!=0 && (
        <InputLabel style={{width:currentlabelwidth.toString()+'%'}} htmlFor={`${getName(name)}`}>{getName(name)}</InputLabel>
        )}
      <Select zindex="tooltip" style={{width:textwidth.toString()+'%'}}
        key={inputKey}
        fullWidth
        multiple={multiple}
        label={getName(name)}
        value={myvalues}
        onChange={onChange}
        renderValue={(selected) => getRenderValue(selected, items, multiple)}
        disabled={disabled}
        {...others}
      >
        {empty && !multiple && (
          <MenuItem key={'None'} value="">
            <Checkbox
              checked={ myvalues === ''}
            />
            <ListItemText primary={'None'} />
          </MenuItem>
        )}

        {        
        items.map((item) => (
          <MenuItem key={item.title} value={item.value}>
            <Checkbox
              checked={
                multiple ? myvalues.indexOf(item.value) > -1 : myvalues === item.value
              }
            />
            <ListItemText primary={item.title} />
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{errorText ? errorText : helperText}</FormHelperText>
      </span>
    </FormControl>
  );
};

CustomSelect.defaultProps = {
  errors: {},
  multiline: false,
};

CustomSelect.propTypes = {
  field: shape({ name: string, type: string, key: string }).isRequired,
  selectedValues: oneOfType([array, oneOfType([string, number])]).isRequired,
  onChange: func.isRequired,
  errors: shape({}),
};

export default CustomSelect;
