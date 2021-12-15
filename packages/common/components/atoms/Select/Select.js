import React, { useEffect } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import OutlinedInput from '@mui/material/OutlinedInput';

// import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

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

  const CheckboxesTags = () => {
    return (
      <Autocomplete
        multiple
        id="checkboxes-tags-demo"
        options={top100Films}
        disableCloseOnSelect
        getOptionLabel={(option) => option.title}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {option.title}
          </li>
        )}
        style={{ width: 500 }}
        renderInput={(params) => (
          <TextField {...params} label="Checkboxes" placeholder="Favorites" />
        )}
      />
    );
  };
  const top100Films = [
    { title: 'The Shawshank Redemption', year: 1994 },
    { title: 'The Godfather', year: 1972 },
    { title: 'The Godfather: Part II', year: 1974 },
    { title: 'The Dark Knight', year: 2008 },
    { title: '12 Angry Men', year: 1957 }
  ];

  const render = () => {
    if (isMulti && isCheckbox) {
      return (
        <>
          {/* <CheckboxesTags /> */}
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
                <Typography style={{ fontWeight: 600 }}>
                  {placeholder}
                </Typography>
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
        </>
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
