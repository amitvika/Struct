import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Headding from '@monostruct/common/components/atoms/Headding';
import Select from '@monostruct/common/components/atoms/Select';
import DynamicCriteria from './DynamicForm';
import CriteriaUploadAPI from '@monostruct/common/api/criteriaUpload.api';
import get from 'lodash/get';
import { useSelector } from 'react-redux';
import DynamicHierarchyDropdowns from '@monostruct/common/containers/DynamicHierarchyDropdowns';

export default function DynamicHierarchy(props) {
  const { setShowKineticModal, handleItemUpdate, renderData, setRenderData } =
    props;
  const currentItem = useSelector((state) => state.item.currentItem);

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

        if (get(currentItem, 'hierarchySelections[0]')) {
          setSelections(get(currentItem, 'hierarchySelections', []));
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
    console.log('value', value);
    if (value === 'Motion Control') {
      setShowKineticModal(true);
    } else {
      setShowKineticModal(false);
    }
  };

  const handleDynamicFormUpdate = (key, updatedFormFields) => {
    const findIndex = selections.findIndex((item) => item.key === key);
    if (findIndex > -1) {
      let tempSelections = [...selections];
      tempSelections[findIndex].formFields = updatedFormFields;
      setSelections(tempSelections);
      setStateUpdated(!stateUpdated);
    }
  };

  if (hierarchyDropdownList.length === 0) {
    return null;
  }
  //console.log("DINEMICHIERARCHY",setRenderData,"SHOW",setShowKineticModal,"UPDATE",handleItemUpdate,"RENDER",renderData);

  return (
    <>
      <DynamicHierarchyDropdowns
        {...{
          handleOnChange,
          hierarchyDropdownList,
          selections,
        }}
      />

      {selections.map((selectionItem) => {
        return (
          <DynamicCriteria
            {...selectionItem}
            handleUpdate={(updatedFormFields) => {
              console.log(
                'Doing Changes in Dynaimc Hirearchy',
                selectionItem.key,
                updatedFormFields
              );
              handleDynamicFormUpdate(selectionItem.key, updatedFormFields);
            }}
            renderData={renderData}
            setRenderData={setRenderData}
          />
        );
      })}
    </>
  );
}
