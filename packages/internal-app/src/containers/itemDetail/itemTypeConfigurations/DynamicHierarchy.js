import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Headding from '@ravibasil/common/components/atoms/Headding';
import Select from '@ravibasil/common/components/atoms/Select';

export default function DynamicHierarchy({
  hierarchyDropdownList = [],
  initialValue,
  setInitialValue,
}) {
  const [dataValue, setDataValue] = useState({});

  const handleOnChange = (label, value) => {
    setDataValue((preData) => {
      return { ...preData, [label]: value };
    });

    const dataIndex = initialValue.indexOf(label);

    setInitialValue((prev) => {
      if (prev.length > dataIndex) {
        return [...prev.slice(0, dataIndex + 1), value];
      }
      return [...prev, value];
    });
  };

  const setValue = (label) => {
    const dataIndex = initialValue.indexOf(label);
    if (initialValue.length > dataIndex && initialValue[dataIndex + 1]) {
      // console.log(initialValue[dataIndex + 1])
      return initialValue[dataIndex + 1];
    }
    return '';
  };

  const renderFields = (fieldItem) => {
    return (
      <Grid container spacing={2} container key={fieldItem.label}>
        <Grid item xs={4}>
          <Headding bold title={fieldItem.label} />
        </Grid>
        <Grid item xs={8}>
          <Select
            placeholder="Select"
            options={fieldItem.options.map((option) => ({
              label: option,
              value: option,
            }))}
            onChange={(data) =>
              handleOnChange(`${fieldItem.label}`, data.value)
            }
            value={setValue(fieldItem.label)}
            // value={dataValue[fieldItem.label] && { label: `${dataValue[fieldItem.label]}` }}
          />
        </Grid>
      </Grid>
    );
  };

  const renderDropdowns = () => {
    return hierarchyDropdownList ? (hierarchyDropdownList.length > 0) ?
      hierarchyDropdownList.filter((item) => {
        if (initialValue.includes(item.label)) {
          return true;
        }
        return false;
      })
      .map((item) => renderFields(item)):false:false;
  };

  return <Paper style={{ padding: 20, margin: 10 }}>{renderDropdowns()}</Paper>;
}
