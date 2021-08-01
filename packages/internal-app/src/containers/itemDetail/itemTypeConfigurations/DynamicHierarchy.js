import React, { useState } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import FileUpload from '@ravibasil/common/components/FileUpload';
import Headding from '@ravibasil/common/components/atoms/Headding';
import Select from '@ravibasil/common/components/atoms/Select';
import Input from '@ravibasil/common/components/atoms/Input';

import readXlsxFile from 'read-excel-file';
import { isArray } from 'lodash';

export default function DynamicHierarchy() {

  const [criteriaFields, setHierarchyFields] = useState({});
  const [currentHierarchyValue, setCurrentHierarchyValue] = useState('Actuator');

  const handleHierarchyFileUpload = (file) => {
    let obj = {};
    let currentHierarachy = ""

    readXlsxFile(file).then((rows) => {
      mapExcelRows(rows);
    })
  }


  const mapExcelRows = (rows) => {

    let currentRow;
    let nextRow;
    let currentValue;
    // let parentValue;
    let currentOptions = {};
    let currentKey = "Item Type";

    let valueForChecking;
    let nameOfParent = "Item Type";

    for (let i = 1; i < rows.length; i++) {

      currentRow = rows[i];
      nextRow = rows[i + 1];

      let currentDataIndex = currentRow.findIndex(dataColumn => dataColumn !== null && dataColumn.trim().length > 0);
      currentValue = currentRow[currentDataIndex];
      valueForChecking = currentValue;
      console.log('>>>>>>>>>>><<<<<<<<<<', currentValue)
      //get parent of current value;

      for (let j = i - 1; j >= 1; j--) {
        let tempCurrentRow = rows[j];
        let tempNextRow = rows[j + 1];

        if (tempCurrentRow !== undefined && tempNextRow !== undefined) {
          let tempCurrentIndex = tempCurrentRow.findIndex(dataColumn => dataColumn !== null && dataColumn.trim().length > 0);
          let tempCurrentValue = tempCurrentRow[tempCurrentIndex];

          if (tempCurrentRow[tempCurrentIndex + 1] === null
            && tempNextRow[tempCurrentIndex] === null
            && tempNextRow[tempCurrentIndex + 1] === valueForChecking) {
            console.log('**************----', tempCurrentValue)
            nameOfParent = tempCurrentValue;
            break;
          }
          else if (tempNextRow[tempCurrentIndex] === valueForChecking) {
            valueForChecking = tempCurrentValue;
            console.log('**************', tempCurrentValue)
          }
          else {
            // nameOfParent = "Item Type";
            console.log('not checked 1', tempCurrentValue, tempNextRow, valueForChecking)
          }
        }
        else {
          nameOfParent = "Item Type";
          console.log('not checked 2')
        }

      }

      // if (
      //   (currentDataIndex + 1) < rows.length
      //   && currentRow[currentDataIndex + 1] === null
      //   && nextRow !== undefined
      //   && nextRow[currentDataIndex] === null
      // ) {
      //   // currentKey = currentValue;
      //   currentOptions[nameOfParent] = [];
      // }
      // else {
      console.log(currentOptions[nameOfParent], "---------", nameOfParent)
      if (isArray(currentOptions[nameOfParent])) {
        currentOptions[nameOfParent] = [...currentOptions[currentKey], currentValue];
      }
      else {
        currentOptions[nameOfParent] = [currentValue];
      }
      // }
    }

    console.log("=====>>>>", currentOptions)
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

  const renderHierarchy = () => {
    if (currentHierarchyValue && criteriaFields[currentHierarchyValue]) {
      let { fields = [], criteriaTitle = "" } = criteriaFields[currentHierarchyValue];
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
      <FileUpload handleFileUpload={handleHierarchyFileUpload} label="Select Hierarchy File" />
      {renderHierarchy()}
    </Paper>
  )
}