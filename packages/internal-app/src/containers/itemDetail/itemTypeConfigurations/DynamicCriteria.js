import React, { useState } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import FileUpload from '@ravibasil/common/components/FileUpload';
import Headding from '@ravibasil/common/components/atoms/Headding';
import Select from '@ravibasil/common/components/atoms/Select';
import Input from '@ravibasil/common/components/atoms/Input';

import readXlsxFile from 'read-excel-file'

export default function DynamicCriteria() {

  const [criteriaFields, setCriteriaFields] = useState({});
  const [currentCrieteriaValue, setCurrentCrieteriaValue] = useState('Actuator|Rotational');

  const handleCriteriaFileUpload = (file) => {
    const map = {
      'Hierarchy Level': 'hierarchyLevel',
      'Criteria Title': 'criteriaTitle',
      'FIELD': {
        'field': {
          'Field Name': "fieldName",
          'Field': 'fieldType',
          'Type': 'dataType',
          'Special Input': 'specialInput',
          'Input Units': 'inputUnits',
          'Numerical Input Min': '',
          'Numerical Input Max': '',
          'Select Options': 'options',
          'Exclusion criteria': 'exclusionCriteria',
          'Inclusion Criteria': 'inclusionCriteria'
        }
      }
    }

    let obj = {};
    let currentHierarachy = ""

    readXlsxFile(file, { map }).then(({ rows }) => {

      rows.map(rowItem => {

        if (rowItem.hierarchyLevel) {
          currentHierarachy = rowItem.hierarchyLevel;

          obj[rowItem.hierarchyLevel] = {
            hierarchyLevel: rowItem.hierarchyLevel,
            criteriaTitle: rowItem.criteriaTitle,
            fields: [rowItem.field]
          };
        }
        else if (!rowItem.hierarchyLevel && currentHierarachy) {
          let { fields } = obj[currentHierarachy];

          if (Array.isArray(fields)) {
            fields.push(rowItem.field);
          }

          obj[currentHierarachy].fields = fields;

        }

      })

      setCriteriaFields(obj)
      // console.log("======>>>", obj)
    })

  }

  const renderFields = (fields) => {
    return fields.map(fieldItem => {
      return (
        <Grid container spacing={2} container key={fieldItem.fieldName}>
          <Grid item xs={4}>
            <Headding bold title={fieldItem.fieldName} />
          </Grid>
          <Grid item xs={8}>
            {
              fieldItem.fieldType === 'Input' &&
              <Input
                placeholder="Enter"
                type={fieldItem.dataType === "Numerical" ? "number" : "text"}
              // onChange={(event) => handleOnChange('xTolerance', event.target.value)}
              // value={itemGeometry.xTolerance}
              />
            }
            {
              fieldItem.fieldType === 'select' &&
              <Select
                placeholder="Select"
                options={fieldItem.options.split('|').map(option => ({ label: option, value: option }))}
              // onChange={(data) => handleOnChange('itemType', data.value)}
              // value={itemGeometry.itemType && { label: itemGeometry.itemType }}
              />
            }

          </Grid>
        </Grid>
      );
    })
  }

  const renderCriteria = () => {
    if (currentCrieteriaValue && criteriaFields[currentCrieteriaValue]) {
      let { fields = [], criteriaTitle = "" } = criteriaFields[currentCrieteriaValue];
      return (
        <Paper style={{ padding: 20, margin: 10 }}>
          <Headding>{criteriaTitle}</Headding>
          {renderFields(fields)}
        </Paper>)
    }
    else {
      return null;
    }
  }

  return (
    <Paper style={{ padding: 20, margin: 10 }}>
      <FileUpload handleFileUpload={handleCriteriaFileUpload} label="Select Criteria File" />
      {renderCriteria()}
    </Paper>
  )
}
