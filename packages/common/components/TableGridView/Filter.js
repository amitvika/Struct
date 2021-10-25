import React, { useState, useEffect } from 'react';

import { Grid, Paper, Icon, Button } from '@material-ui/core';
import Select from '../atoms/Select';
import SearchIcon from '@material-ui/icons/Search';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: '100%'
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
  },
  iconButton: {
    padding: 10
  },
  divider: {
    height: 28,
    margin: 4
  }
}));

export default function Filter({
  list = [],
  filteredList = [],
  setFilteredList = () => {},
  columnsFields = [],
  isSearchBarVisible = false,
  setIsFilterResetted = () => {}
}) {
  const classes = useStyles();

  const [selectedFieldName, setSelectedFieldName] = useState('');
  const [selectedFieldOptions, setSelectedFieldOptions] = useState([]);
  const [selectedFields, setSelectedFields] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = (updatedSelectedFields) => {
    const myArrayFiltered = list.filter((el) => {
      let flag = true;

      Object.keys(updatedSelectedFields).forEach((key) => {
        const fieldValues = updatedSelectedFields[key];

        if (flag && fieldValues.length > 0) {
          flag = fieldValues.some((f) => f === el[key]);
        }
      });

      return flag;
    });
    setIsFilterResetted(false);
    setFilteredList(myArrayFiltered);
  };

  const handleChange = (data, field) => {
    setSelectedFieldOptions(get_unique_options(field));

    const updatedSelectedFields = { ...selectedFields, [field]: data };
    setSelectedFields(updatedSelectedFields);
    setSelectedFieldName(field);

    filtered(updatedSelectedFields);
  };

  const get_unique_options = (field) => {
    if (field === selectedFieldName) {
      return selectedFieldOptions;
    }

    const array = filteredList;

    let flags = [],
      output = [],
      l = array.length,
      i;

    for (i = 0; i < l; i++) {
      if (flags[array[i][field]]) {
        continue;
      }

      let tempValue = array[i][field];
      if (tempValue && tempValue.length > 0) {
        flags[array[i][field]] = true;
        output.push(array[i][field]);
      }
    }
    return output;
  };

  const getValues = (item) => {
    if (selectedFields[item.field]) {
      return selectedFields[item.field];
    } else {
      return [];
    }
  };

  const handleSearchInput = (event) => {
    let searchText = event.target.value;
    setSearchTerm(searchText);

    const filteredData = list.filter((item) => {
      for (const key in item) {
        const currentValue = item[key];
        if (
          typeof currentValue === 'string' &&
          currentValue.includes(searchText)
        ) {
          return true;
        }
      }
      return false;
    });
    setIsFilterResetted(false);
    setFilteredList(filteredData);
  };

  const renderItem = () => {
    let item = [];

    columnsFields
      .filter((fieldItem) =>
        fieldItem.isFilterColumn === false ? fieldItem.isFilterColumn : true
      )
      .map((fieldItem, index) => {
        item.push(
          <Grid item style={{ flex: 1 }} key={`filteritem_${fieldItem.title}`}>
            <Select
              isCheckbox
              isMulti
              onChange={(data) => handleChange(data, fieldItem.field)}
              options={get_unique_options(fieldItem.field)}
              placeholder={`Select ${fieldItem.title}`}
              value={getValues(fieldItem)}
              label={fieldItem.title}
            />
          </Grid>
        );
      });

    if (isSearchBarVisible) {
      item.push(
        <Grid item style={{ flex: 1 }} key={`filter_search_text`}>
          <TextField
            className={classes.margin}
            id="input-with-icon-textfield"
            variant="outlined"
            size="small"
            onChange={handleSearchInput}
            value={searchTerm}
            placeholder={'Enter'}
            style={{ top: 0 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Grid>
      );
    }
    return item;
  };

  return (
    <Grid
      container
      spacing={3}
      style={{ margin: 0, justifyContent: 'center', paddingRight: '15px' }}
    >
      <Grid item>
        <SearchIcon />
      </Grid>

      <Grid item>
        <Button
          variant="contained"
          color="primary"
          type="button"
          value="Clear"
          onClick={() => {
            setIsFilterResetted(true);
            setFilteredList(list);
            setSelectedFields({});
            setSearchTerm('');
          }}
        >
          Clear
        </Button>
      </Grid>
      {renderItem()}
    </Grid>
  );
}
