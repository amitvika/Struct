import React, { useState, useEffect } from 'react';
import DynamicCriteria from './DynamicForm';
import get from 'lodash/get';
import { useSelector } from 'react-redux';
import DynamicHierarchyDropdowns from '@monostruct/common/containers/DynamicHierarchyDropdowns';

export default function DynamicHierarchy(props) {
  const {
    setShowKineticModal,
    handleItemUpdate,
    renderData,
    setRenderData,
    internalProductConfig
  } = props;
  const currentItem = useSelector((state) => state.item.currentItem);

  const [hierarchyDropdownList, setHierarchyDropdownList] = useState([]);
  const [selections, setSelections] = useState([
    { key: 'Internal Use Product Configuration', formFields: [] }
  ]);
  const [stateUpdated, setStateUpdated] = useState(false);

  useEffect(() => {
    handleItemUpdate({ hierarchySelections: selections });
  }, [stateUpdated]);

  useEffect(() => {
    const hierarchySchemaArr = get(
      internalProductConfig,
      'hierarchySchema',
      []
    );
    setHierarchyDropdownList(hierarchySchemaArr);

    if (get(currentItem, 'hierarchySelections[0]')) {
      setSelections(get(currentItem, 'hierarchySelections', []));
    }
  }, []);

  const handleOnDropdownSelection = ({ value }) => {
    if (value === 'Motion Control') {
      setShowKineticModal(true);
    } else {
      setShowKineticModal(false);
    }
    setStateUpdated(!stateUpdated);
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
          handleOnDropdownSelection,
          hierarchyDropdownList,
          selections,
          setSelections
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
