import React, { useEffect } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import OutlinedInput from '@mui/material/OutlinedInput';

const MenuProps = {
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'left'
  },
  transformOrigin: {
    vertical: 'top',
    horizontal: 'left'
  },
  getContentAnchorEl: null
};

const SelectExample = ({
  htmlFor,
  label,
  options,
  width,
  field = {},
  form = {},
  allowCustomInput = false,
  placeholder = 'Select',
  isMulti,
  onChange,
  onInputChange,
  value,
  onCustomOnChange,
  isCheckbox,
  id,
  isRequired = false,
  hasError = null,
  size = 'small',
  ...props
}) => {
  const handleChange = (event) => {
    onChange({ value: event.target.value, label: event.target.value });
  };

  const render = () => {
    if (isMulti && isCheckbox) {
      return (
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          multiple
          onChange={(event) => onChange(event.target.value)}
          value={value}
          input={<OutlinedInput label={label} />}
          renderValue={(selected) => {
            if (value && value.length > 0) {
              return <span>{`${value.length} ${label} selected`}</span>;
            }
            return (
              <Typography style={{ fontWeight: 600 }}>{placeholder}</Typography>
            );
          }}
          MenuProps={MenuProps}
          displayEmpty
        >
          <MenuItem disabled value="">
            <Typography style={{ fontWeight: 600 }}>{placeholder}</Typography>
          </MenuItem>
          {options.map((option) => {
            return (
              <MenuItem key={option} value={option}>
                <Checkbox checked={value && value.indexOf(option) > -1} />
                <ListItemText primary={option} />
              </MenuItem>
            );
          })}
        </Select>
      );
    } else if (isMulti) {
      return (
        <Select
          labelId={`${id}-label`}
          id={id}
          multiple
          value={value}
          onChange={onChange}
          input={<OutlinedInput label={label} />}
          MenuProps={MenuProps}
        >
          <MenuItem disabled value="">
            <span>{placeholder}</span>
          </MenuItem>
          {options.map((option) => {
            return (
              <MenuItem key={option.label} value={option.value}>
                {option.label}
              </MenuItem>
            );
          })}
        </Select>
      );
    } else {
      let initialValue = '';
      if (value) {
        initialValue = value.value ? value.value : value;
      }
      return (
        <Select
          labelId={`${id}-label`}
          id={id}
          value={initialValue}
          onChange={handleChange}
          input={<OutlinedInput label={label} />}
          MenuProps={MenuProps}
          displayEmpty
        >
          <MenuItem disabled value="">
            <Typography style={{ fontWeight: 600 }}>{placeholder}</Typography>
          </MenuItem>
          {options.map((option) => {
            return (
              <MenuItem key={option.label} value={option.value}>
                {option.label}
              </MenuItem>
            );
          })}
        </Select>
      );
    }
  };

  return (
    <FormControl sx={{ width: '100%' }} size={size}>
      {render()}
      {hasError && <FormHelperText>This is required!</FormHelperText>}
    </FormControl>
  );
};

SelectExample.defaultProps = {
  htmlFor: 'unnamed',
  onChange: () => {},
  onInputChange: () => {}
};

export default SelectExample;
