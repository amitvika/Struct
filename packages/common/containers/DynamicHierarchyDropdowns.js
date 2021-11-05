import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Headding from '@monostruct/common/components/atoms/Headding';
import Select from '@monostruct/common/components/atoms/Select';

export default function DynamicHierarchy(props) {
  const {
    handleOnDropdownSelection = () => {},
    hierarchyDropdownList = [],
    selections = [],
    setSelections = () => {},
    inToolbar = false,
    isPaperContainer = true,
    filterTitle
  } = props;

  const handleDropdownSelection = (title, value, form) => {
    // [{key : 'Item Type' , value: 'Actuator', form: []}]
    let indexOfCurrentSelection = selections.findIndex(
      (item) => item.key === title
    );

    let tempSelections = selections;

    if (
      indexOfCurrentSelection > -1 &&
      indexOfCurrentSelection < selections.length - 1
    ) {
      tempSelections = selections.slice(0, indexOfCurrentSelection + 1);
    } else if (selections.length > 0 && indexOfCurrentSelection < 0) {
      indexOfCurrentSelection = selections.length;
      tempSelections[indexOfCurrentSelection] = {};
    } else if (selections.length === 0) {
      indexOfCurrentSelection = 0;
      tempSelections[indexOfCurrentSelection] = {};
    }

    tempSelections[indexOfCurrentSelection].key = title;
    tempSelections[indexOfCurrentSelection].value = value;
    if (form && form.fields) {
      tempSelections[indexOfCurrentSelection].formFields = form.fields;
    } else {
      tempSelections[indexOfCurrentSelection].formFields = undefined;
    }

    setSelections(tempSelections);
  };

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

  const handleOnChange = ({ data, fieldItem }) => {
    const form = getFormFromOptions(fieldItem.options, data.value);
    handleDropdownSelection(`${fieldItem.title}`, data.value, form);
    handleOnDropdownSelection({ value: data.value });
  };

  const renderFields = (fieldItem, index) => {
    let title =
      fieldItem.headerName === null ? fieldItem.title : fieldItem.headerName;

    if (inToolbar) {
      return (
        <Grid
          item
          style={{ flex: 1, maxWidth: '25%' }}
          key={`dditem_${title + index}`}
        >
          <Select
            id={fieldItem.title}
            placeholder={`${title}`}
            options={fieldItem.options}
            onChange={(data) => handleOnChange({ fieldItem, data })}
            value={getSelectionValue(fieldItem.title)}
          />
        </Grid>
      );
    }

    return (
      <Grid container spacing={2} key={`dditem_${title + index}`}>
        <Grid item xs={4}>
          <Headding bold title={title} />
        </Grid>
        <Grid item xs={8}>
          <Select
            placeholder="Select"
            options={fieldItem.options}
            onChange={(data) => handleOnChange({ fieldItem, data })}
            value={getSelectionValue(fieldItem.title)}
          />
        </Grid>
      </Grid>
    );
  };

  const getIndexOfFieldInSelectionArray = (selections, listItem) => {
    return selections.findIndex((item) => {
      if (
        item.key === listItem.title ||
        (item.value && item.value.includes(listItem.title))
      ) {
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
      .map((listItem, index) => renderFields(listItem, index));
  };

  if (hierarchyDropdownList.length === 0) {
    return null;
  }

  if (inToolbar) {
    return (
      <Grid
        container
        spacing={3}
        style={{
          margin: 0,
          justifyContent: 'start',
          paddingRight: '15px',
          marginLeft: '142px'
        }}
      >
        {filterTitle && (
          <Grid
            item
            style={{ flex: 1, maxWidth: '25%' }}
            key={`dditem_${filterTitle}`}
          >
            <Headding bold title={filterTitle} />
          </Grid>
        )}
        {renderDropdowns()}
      </Grid>
    );
  }

  if (isPaperContainer) {
    return (
      <Paper style={{ padding: 20, margin: 10 }}>{renderDropdowns()}</Paper>
    );
  }

  return renderDropdowns();
}
