import React, { useEffect, useState } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Headding from '@ravibasil/common/components/atoms/Headding';
import Select from '@ravibasil/common/components/atoms/Select';
import Input from '@ravibasil/common/components/atoms/Input';

export default function DynamicCriteria({
  currentCrieteriaValue,
  criteriaFields,
}) {
  const renderFields = (fields) => {
    return fields.map((fieldItem) => {
      return (
        <Grid container spacing={2} container key={fieldItem.fieldName}>
          <Grid item xs={4}>
            <Headding bold title={fieldItem.fieldName} />
          </Grid>
          <Grid item xs={8}>
            {fieldItem.fieldType === 'Input' && (
              <Input
                placeholder="Enter"
                type={fieldItem.dataType === 'Numerical' ? 'number' : 'text'}
                // onChange={(event) => handleOnChange('xTolerance', event.target.value)}
                // value={itemGeometry.xTolerance}
              />
            )}
            {fieldItem.fieldType === 'select' && (
              <Select
                placeholder="Select"
                options={fieldItem.options
                  .split('|')
                  .map((option) => ({ label: option, value: option }))}
                // onChange={(data) => handleOnChange('itemType', data.value)}
                // value={itemGeometry.itemType && { label: itemGeometry.itemType }}
              />
            )}
          </Grid>
        </Grid>
      );
    });
  };

  const renderCriteria = () => {
    if (currentCrieteriaValue && criteriaFields[currentCrieteriaValue]) {
      let { fields = [], criteriaTitle = '' } =
        criteriaFields[currentCrieteriaValue];
      return (
        <Paper style={{ padding: 20, margin: 10 }}>
          <Headding style={{fontSize: 24}}>{criteriaTitle}</Headding>
          {renderFields(fields)}
        </Paper>
      );
    } else {
      return null;
    }
  };

  return renderCriteria();
}
