import React, { useState, useEffect } from 'react'
import Grid from '@material-ui/core/Grid';

import SelectCheckboxes from './atoms/SelectCheckboxes';
import { Button } from "@material-ui/core";

export default function CheckboxFilter({
  list,
  filteredList,
  setFilteredList,
  columnsFields
}) {

  const [selectedFieldName, setSelectedFieldName] = useState('');
  const [selectedFieldOptions, setSelectedFieldOptions] = useState([]);

  const [selectedFields, setSelectedFields] = useState({});

  const handleChange = (data, field) => {
    setSelectedFieldOptions(get_unique_options(field))

    setSelectedFields(prev => {
      return {
        ...prev,
        [field]: data
      }
    });
    setSelectedFieldName(field)
  }

  useEffect(() => {
    filtered();
  }, [selectedFields])

  const filtered = () => {
    const myArrayFiltered = list.filter((el) => {
      let flag = true;

      Object.keys(selectedFields).forEach(key => {
        const fieldValues = selectedFields[key];

        if (flag && fieldValues.length > 0) {
          flag = fieldValues.some((f) => f.label === el[key]);
        }
      });

      return flag;
    });

    setFilteredList(myArrayFiltered)
  }

  const get_unique_options = (field) => {
    if (field === selectedFieldName) {
      return selectedFieldOptions;
    }

    const array = filteredList;

    let flags = [], output = [], l = array.length, i;

    for (i = 0; i < l; i++) {
      if (flags[array[i][field]]) {
        continue;
      }
      flags[array[i][field]] = true;
      output.push({ label: array[i][field], value: array[i][field] });
    }
    return output;
  }

  return (
    <>{
      columnsFields.map(fieldItem => {
        return (
          <Grid item sm sm={2}>
            <SelectCheckboxes
              onChange={(data) => handleChange(data, fieldItem)}
              options={get_unique_options(fieldItem)}
              placeholder={`Select ${fieldItem}`} />
          </Grid>
        )
      })
    }
      <Grid item sm sm={2} style={{ justifyContent: 'center', display: 'flex' }}>
        <Button
          variant="contained"
          color="primary"
          type="button"
          onClick={() => setSelectedFields({})}>
          Clear
          </Button>
      </Grid>
    </>
  )
}
