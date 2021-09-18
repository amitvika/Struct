import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Headding from '@monostruct/common/components/atoms/Headding';
import Select from '@monostruct/common/components/atoms/Select';
import DynamicCriteria from './DynamicCriteria';
import CriteriaUploadAPI from '@monostruct/common/api/criteriaUpload.api';
import get from 'lodash/get';

export default function DynamicHierarchy(props) {
  const [initialValue, setInitialValue] = useState(['Item Type']);
  const [criteriaFields, setCriteriaFields] = useState({});
  const [hierarchyDropdownList, setHierarchyDropdownList] = useState([]);
  const [firstDropdown, setFirstDropdown] = useState({});
  const [firstSelectedValue, setFirstSelectedValue] = useState('');
  const [dropdownSelections, setDropdownSelections] = useState([]);

  useEffect(() => {
    CriteriaUploadAPI.getCadDetails()
      .then((resp) => {
        const hierarchySchemaArr = get(resp, 'data.hierarchySchema', []);
        if (hierarchySchemaArr[0]) {
          setFirstDropdown(hierarchySchemaArr[0]);
          hierarchySchemaArr.shift();
          setHierarchyDropdownList(hierarchySchemaArr);
        }
        setCriteriaFields(get(resp, 'data.criteriaSchema', []));
      })
      .catch((error) => {});
  }, []);

  const handleOnChangeForFirstDropDown = (label, value) => {
    setFirstSelectedValue(value);
    setDropdownSelections([value]);
  };

  const handleOnChangeRestDropdown = (label, value, dropValue) => {
    setDropdownSelections([...dropdownSelections, value]);

    console.log('--------dropValue', dropValue);
    setInitialValue(dropValue);
  };

  const setValue = (label) => {
    const dataIndex = dropdownSelections.indexOf(label);
    if (
      dropdownSelections.length > dataIndex &&
      dropdownSelections[dataIndex + 1]
    ) {
      // console.log(initialValue[dataIndex + 1])
      return dropdownSelections[dataIndex + 1];
    }
    return '';
  };

  const renderFields = (fieldItem, handleOnChange) => {
    return (
      <Grid container spacing={2} key={fieldItem.label}>
        <Grid item xs={4}>
          <Headding bold title={fieldItem.label} />
        </Grid>
        <Grid item xs={8}>
          <Select
            placeholder="Select"
            options={fieldItem.options.map((option) => ({
              label: option,
              value: option,
              dropValue: `${fieldItem.label}|${option}`,
            }))}
            onChange={(data) =>
              handleOnChange(`${fieldItem.label}`, data.value, data.dropValue)
            }
            value={setValue(fieldItem.label)}
          />
        </Grid>
      </Grid>
    );
  };

  const renderDropdowns = () => {
    return hierarchyDropdownList
      .filter((item) => {
        if (dropdownSelections.includes(item.label)) {
          return true;
        }
        return false;
      })
      .map((item) => renderFields(item, handleOnChangeRestDropdown));
  };

  const renderFirstDropdown = () =>
    renderFields(firstDropdown, handleOnChangeForFirstDropDown);

  if (hierarchyDropdownList.length === 0) {
    return null;
  }

  return (
    <>
      <Paper style={{ padding: 20, margin: 10 }}>
        {renderFirstDropdown()}
        {renderDropdowns()}
      </Paper>

      <DynamicCriteria
        criteriaFields={criteriaFields}
        selectedField={firstSelectedValue}
      />
      <DynamicCriteria
        criteriaFields={criteriaFields}
        selectedField={initialValue}
      />
    </>
  );
}
