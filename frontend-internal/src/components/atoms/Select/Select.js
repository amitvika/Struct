import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Select from '@material-ui/core/Select';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import InputBase from '@material-ui/core/InputBase';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const BootstrapInput = withStyles((theme) => ({
  root: {
    width: '100%',
    'label + &': {
      marginTop: theme.spacing(3),
    },
  },
  input: {
    borderRadius: 4,
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #ced4da',
    fontSize: 14,
    padding: '8px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:focus': {
      borderRadius: 4,
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
    },
  },
}))(InputBase);

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
          multiple
          onChange={(event) => onChange(event.target.value)}
          value={value}
          input={<BootstrapInput />}
          renderValue={(selected) => {
            return <span>{placeholder}</span>;
          }}
        >
          <MenuItem disabled value="">
            <em>{placeholder}</em>
          </MenuItem>
          {
            options.map(option => {
              return (<MenuItem key={option} value={option}>
                <Checkbox checked={value.indexOf(option) > -1} />
                <ListItemText primary={option} />
              </MenuItem>)
            })
          }

        </Select>
      )
    }
    else if (isMulti) {
      return (
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          multiple
          value={value}
          onChange={onChange}
          input={<BootstrapInput />}>
          <MenuItem disabled value="">
            <em>{placeholder}</em>
          </MenuItem>
          {
            options.map(option => {
              return (<MenuItem key={option.label} value={option.value}>{option.label}</MenuItem>)
            })
          }

        </Select>
      )
    }
    else {
      return (
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={value && value.label ? value.label : `${value}`}
          onChange={handleChange}
          input={<BootstrapInput />}>
          <MenuItem disabled value="">
            <em>{placeholder}</em>
          </MenuItem>
          {
            options.map(option => {
              return (<MenuItem key={option.label} value={option.value}>{option.label}</MenuItem>)
            })
          }
        </Select>
      )
    }
  }

  return (
    <>
      {/* <FormControl className={classes.formControl}>
        <InputLabel id="demo-mutiple-name-label">{placeholder}</InputLabel> */}
      {render()}
      {/* </FormControl> */}

    </>
  );
};

SelectExample.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape()),
  htmlFor: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  width: PropTypes.number,
  field: PropTypes.shape(),
  form: PropTypes.shape(),
  onChange: PropTypes.func,
  onInputChange: PropTypes.func
};

SelectExample.defaultProps = {
  htmlFor: 'unnamed',
  onChange: () => { },
  onInputChange: () => { }
};

export default SelectExample;
