import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Headding from '@monostruct/common/components/atoms/Headding';
import Select from '@monostruct/common/components/atoms/Select';

export default function DynamicHierarchy(props) {
  const { handleOnChange, hierarchyDropdownList, selections } = props;

  const getSelectionValue = (title) => {
    const dataIndex = selections.findIndex((item) => item.key === title);
    if (dataIndex > -1) {
      return selections[dataIndex].value;
    }
    return '';
  };

  const getFormFromOptions = (options, valueFinder) => {
    const dataIndex = options.findIndex((item) => item.value === valueFinder);

    if (dataIndex > -1) {
      return options[dataIndex].form;
    } else {
      return undefined;
    }
  };

  const renderFields = (fieldItem) => {
    return (
      <Grid container spacing={2} key={fieldItem.title}>
        <Grid item xs={4}>
          <Headding bold title={fieldItem.title} />
        </Grid>
        <Grid item xs={8}>
          <Select
            placeholder="Select"
            options={fieldItem.options}
            onChange={(data) => {
              const form = getFormFromOptions(fieldItem.options, data.value);
              handleOnChange(`${fieldItem.title}`, data.value, form);
            }}
            value={getSelectionValue(fieldItem.title)}
          />
        </Grid>
      </Grid>
    );
  };

  const getIndexOfFieldInSelectionArray = (selections, listItem) => {
    return selections.findIndex((item) => {
      if (item.key === listItem.title) {
        return true;
      } else if (item.value === listItem.title) {
        return true;
      } else {
        return false;
      }
    });
  };

  const renderDropdowns = () => {
    return hierarchyDropdownList
      .filter((listItem) => {
        let index = getIndexOfFieldInSelectionArray(selections, listItem);
        if (index > -1) {
          return true;
        }
        return false;
      })
      .map((listItem) => renderFields(listItem));
  };

  if (hierarchyDropdownList.length === 0) {
    return null;
  }

  return <Paper style={{ padding: 20, margin: 10 }}>{renderDropdowns()}</Paper>;
}
