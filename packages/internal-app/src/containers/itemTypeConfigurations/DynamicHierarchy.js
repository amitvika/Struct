import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Headding from '@monostruct/common/components/atoms/Headding';
import Select from '@monostruct/common/components/atoms/Select';
import DynamicCriteria from './DynamicForm';
import CriteriaUploadAPI from '@monostruct/common/api/criteriaUpload.api';
import get from 'lodash/get';
import { useSelector } from 'react-redux';

export default function DynamicHierarchy({
  setShowKineticModal,
  handleItemUpdate,
}) {

  const currentItem = useSelector(state => state.item.currentItem);

  const [hierarchyDropdownList, setHierarchyDropdownList] = useState([]);
  const [selections, setSelections] = useState([
    { key: 'Item Type', formFields: [] },
  ]);
  const [stateUpdated, setStateUpdated] = useState(false);

  useEffect(() => {
    handleItemUpdate({ hierarchySelections: selections });
  }, [stateUpdated]);

  useEffect(() => {
    CriteriaUploadAPI.getCadDetails()
      .then((resp) => {
        const hierarchySchemaArr = get(resp, 'data.hierarchySchema', []);
        setHierarchyDropdownList(hierarchySchemaArr);

        if(get(currentItem, 'hierarchySelections[0]')){
          setSelections(get(currentItem, 'hierarchySelections',[]));
        }
      })
      .catch((error) => {});
  }, []);

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
      tempSelections = selections.slice(
        indexOfCurrentSelection + 1,
        selections.length
      );
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
    setStateUpdated(!stateUpdated);
  };

  const handleOnChange = (title, value, form) => {
    handleDropdownSelection(title, value, form);
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

  const handleDynamicFormUpdate = (key, updatedFormFields) => {
    const findIndex = selections.findIndex((item) => item.key === key);
    let tempSelections = selections;

    if (findIndex > -1) {
      tempSelections[findIndex].formFields = updatedFormFields;

      setSelections(tempSelections);
      setStateUpdated(!stateUpdated);
    }
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

  return (
    <>
      <Paper style={{ padding: 20, margin: 10 }}>{renderDropdowns()}</Paper>

      {selections.map((selectionItem) => {
        return (
          <DynamicCriteria
            {...selectionItem}
            handleUpdate={(updatedFormFields) =>
              handleDynamicFormUpdate(selectionItem.key, updatedFormFields)
            }
          />
        );
      })}
    </>
  );
}
