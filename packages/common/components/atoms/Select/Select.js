import React, { useEffect } from 'react';
import Select from '@mui/material/Select';
import makeStyles from '@mui/styles/makeStyles';
import withStyles from '@mui/styles/withStyles';
import MenuItem from '@mui/material/MenuItem';
import InputBase from '@mui/material/InputBase';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';

const useStyles = makeStyles((theme) => ({
  formControl: {
    width: '100%'
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  }
}));

const BootstrapInput = withStyles((theme) => ({
  root: {
    width: '100%',
    'label + &': {
      marginTop: theme.spacing(3)
    }
  },
  input: {
    borderRadius: 4,
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #ced4da',
    fontSize: theme.typography.fontSize,
    padding: '8px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&:focus': {
      borderRadius: 4,
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)'
    }
  }
}))(InputBase);

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
  ...props
}) => {
  const classes = useStyles();

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
          input={<BootstrapInput />}
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
          input={<BootstrapInput />}
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
          input={<BootstrapInput />}
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
    <FormControl className={classes.formControl} error={hasError}>
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
