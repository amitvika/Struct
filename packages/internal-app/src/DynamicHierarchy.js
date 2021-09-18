import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import FileUpload from '@monostruct/common/components/FileUpload';
import Headding from '@monostruct/common/components/atoms/Headding';
import Select from '@monostruct/common/components/atoms/Select';
import readXlsxFile from 'read-excel-file';
import DynamicCriteria from './containers/itemTypeConfigurations/DynamicCriteria';

export default function DynamicHierarchy() {
  const [hierarchyDropdownList, setHierarchyDropdownList] = useState([]);
  const [dataValue, setDataValue] = useState({});
  const [initialValue, setInitialValue] = useState(['Item Type']);

  const handleHierarchyFileUpload = (file) => {
    readXlsxFile(file).then((rows) => {
      mapExcelRows(rows);
    });
  };

  const mapExcelRows = (rows) => {
    const numOfRows = rows.length;

    let dropList = [];
    let initialDropdown = { label: 'Item Type', options: [] };

    for (let i = 1; i < numOfRows; i++) {
      let dataRow = rows[i];
      if (dataRow[0]) {
        initialDropdown.options.push(dataRow[0]);
      }
    }

    dropList.push(initialDropdown);

    for (let i = 1; i < numOfRows; i++) {
      let dataRow = rows[i];
      let valueIndex = dataRow.findIndex(
        (dataColumn) => dataColumn !== null && dataColumn.trim().length > 0
      );
      let value = dataRow[valueIndex];
      let options = [];

      for (let j = i + 1; j < numOfRows; j++) {
        let nextDataRow = rows[j];
        let nextValueIndex = nextDataRow.findIndex(
          (dataColumn) => dataColumn !== null && dataColumn.trim().length > 0
        );

        if (valueIndex + 1 === nextValueIndex) {
          options.push(nextDataRow[nextValueIndex]);
        } else if (valueIndex < nextValueIndex) {
        } else if (valueIndex === nextValueIndex) {
          break;
        }
      }

      if (options.length > 0) {
        dropList.push({ label: value, options });
      }
    }
    setHierarchyDropdownList(dropList);
  };

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
    return hierarchyDropdownList
      ? hierarchyDropdownList.length <= 0
        ? false
        : hierarchyDropdownList
            .filter((item) => {
              if (initialValue.includes(item.label)) {
                return true;
              }
              return false;
            })
            .map((item) => renderFields(item))
      : false;
  };

  return (
    <>
      <Paper style={{ padding: 20, margin: 10 }}>
        <FileUpload
          handleFileUpload={handleHierarchyFileUpload}
          label="Select Hierarchy File"
        />
        <Paper style={{ padding: 20, margin: 10 }}>
          <Headding>{'criteriaTitle'}</Headding>
          {renderDropdowns()}
        </Paper>
      </Paper>

      <DynamicCriteria
        currentCrieteriaValue={initialValue.slice(1).join('|')}
      />
    </>
  );
}
