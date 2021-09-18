import React, { useState, useEffect,useContext } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Headding from '@ravibasil/common/components/atoms/Headding';
import Select from '@ravibasil/common/components/atoms/Select';
import DynamicCriteria from './DynamicCriteria';
import CriteriaUploadAPI from '@ravibasil/common/api/criteriaUpload.api';
import get from 'lodash/get';

export default function DynamicHierarchy(props) {
  const [dataValue, setDataValue] = useState({});
  const [initialValue, setInitialValue] = useState(['Item Type']);
  const [criteriaFields, setCriteriaFields] = useState({});
  const [hierarchyDropdownList, setHierarchyDropdownList] = useState([]);

  useEffect(() => {
    CriteriaUploadAPI.getCadDetails()
      .then((resp) => {
        setHierarchyDropdownList(get(resp, 'data.hierarchySchema', {}));
        setCriteriaFields(get(resp, 'data.criteriaSchema', []));
      })
      .catch((error) => {});
  }, []);

  const handleOnChange = (label, value) => {
    setDataValue((preData) => {
      return { ...preData, [label]: value };
    });

    const dataIndex = initialValue.indexOf(label);

    console.log('-----', initialValue, value,dataIndex);


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
          />
        </Grid>
      </Grid>
    );
  };

  const renderDropdowns = () => {
    return hierarchyDropdownList
      .filter((item) => {
        // setItemType(initialValue)
        if (initialValue.includes(item.label)) {
         
          // console.log("setItem Type", setItemType)
          return true;
        }
        return false;
      })
      .map((item) => renderFields(item));
     
  };


  if (hierarchyDropdownList.length === 0) {
    return null;
  }

  return (
    <>
      <Paper style={{ padding: 20, margin: 10 }}>{renderDropdowns()}</Paper>
      <DynamicCriteria
        criteriaFields={criteriaFields}
        currentCrieteriaValue={initialValue.slice(1).join('|')}
      />
    </>
  );
}
