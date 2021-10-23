import React, { useState, useEffect } from 'react';

import { Grid, Paper, Icon, Button } from '@material-ui/core';
import Select from '../atoms/Select';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';

import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

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

const StyledTableCell = withStyles((theme) => ({
  root: {
    paddingLeft: '5px',
    paddingRight: '5px',
    borderBottom: 'none',
    justifyContent: 'center'
  }
}))(TableCell);

export default function Filter({
  list = [],
  filteredList = [],
  setFilteredList = () => {},
  columnsFields = [],
  isSearchBarVisible = false
}) {
  const classes = useStyles();

  const [selectedFieldName, setSelectedFieldName] = useState('');
  const [selectedFieldOptions, setSelectedFieldOptions] = useState([]);
  const [selectedFields, setSelectedFields] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    filtered();
  }, [selectedFields]);

  const filtered = () => {
    const myArrayFiltered = list.filter((el) => {
      let flag = true;

      Object.keys(selectedFields).forEach((key) => {
        const fieldValues = selectedFields[key];

        if (flag && fieldValues.length > 0 && fieldValues.length !== 1) {
          flag = fieldValues.some((f) => f === el[key]);
        }
      });

      return flag;
    });

    setFilteredList(myArrayFiltered);
  };

  const handleChange = (data, field) => {
    setSelectedFieldOptions(get_unique_options(field));

    setSelectedFields((prev) => {
      return {
        ...prev,
        [field]: data
      };
    });
    setSelectedFieldName(field);
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
      return [''];
    }
  };

  const handleSearchInput = (event) => {
    let searchText = event.target.value;
    setSearchTerm(searchText);

    const filteredData = list.filter((item) => {
      for (const key in item) {
        const currentValue = item[key];
        console.log('current value', currentValue);
        if (
          typeof currentValue === 'string' &&
          currentValue.includes(searchText)
        ) {
          return true;
        }
      }
      return false;
    });
    setFilteredList(filteredData);
  };

  const renderItem = () => {
    let item = [];
    let columns = Object.keys(columnsFields).length;
    if (isSearchBarVisible) {
      columns += 1;
    }
    let sizeOfEachEl = parseInt(90 / columns);
    columnsFields
      .filter((fieldItem) =>
        fieldItem.isFilterColumn === false ? fieldItem.isFilterColumn : true
      )
      .map((fieldItem, index) => {
        item.push(
          // <StyledTableCell
          //   width={`${sizeOfEachEl}%`}
          //   key={`${fieldItem.field}`}
          // >
          <Grid item style={{flex: 1}}>
            <Select
              isCheckbox
              isMulti
              onChange={(data) => handleChange(data, fieldItem.field)}
              options={get_unique_options(fieldItem.field)}
              placeholder={`Select ${fieldItem.title}`}
              value={getValues(fieldItem)}
            />
            {/* </StyledTableCell> */}
          </Grid>
        );
      });

    if (isSearchBarVisible) {
      item.push(
        <Grid item style={{flex: 1}}>
          {/* <StyledTableCell width={`${sizeOfEachEl}%`} key={`search_box`}> */}
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
          {/* </StyledTableCell> */}
        </Grid>
      );
    }
    return item;
  };

  return (
    <Grid container spacing={3} style={{ margin: 0, justifyContent: 'center' }}>
      {/* <Table className={classes.table} aria-label="simple table">
      <TableHead>
        <TableRow>
          <StyledTableCell width={`5%`}> */}
      <Grid item>
        <SearchIcon />
      </Grid>
      {/* </StyledTableCell>
          <StyledTableCell width={`5%`}> */}
      <Grid item>
        <Button
          variant="contained"
          color="primary"
          type="button"
          value="Clear"
          onClick={() => {
            setFilteredList(list);
            setSelectedFields({});
            setSearchTerm('');
          }}
        >
          Clear
        </Button>
      </Grid>
      {/* </StyledTableCell> */}

      {renderItem()}
      {/* </TableRow>
      </TableHead> */}
      {/* </Table> */}
    </Grid>
  );
}
