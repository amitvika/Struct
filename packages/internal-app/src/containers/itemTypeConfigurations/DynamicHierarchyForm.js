import React, { useState, useEffect } from 'react';
import DynamicCriteria from './DynamicForm';
import get from 'lodash/get';
import { useSelector } from 'react-redux';
import DynamicHierarchyDropdowns from '@monostruct/common/containers/DynamicHierarchyDropdowns';

export default function DynamicHierarchyForm(props) {
  const {
    setShowKineticModal,
    handleItemUpdate,
    renderData,
    setRenderData,
    internalProductConfig,
    gltfjson,
    itemProperties,
    setSelectedOption,
    setIsCircularFaceOrEdgeSelection,
    handleRotationalAxisChange,
    kinematicItemList,
    setKinematicItemList,
    selected3JSData
  } = props;
  const currentItem = useSelector((state) => state.item.currentItem);

  const [hierarchyDropdownList, setHierarchyDropdownList] = useState([]);
  const [criteriaForms, setCriteriaForms] = useState({});

  const getDefaultSelection = () => {
    if (get(itemProperties, 'hierarchySelections[0]')) {
      return itemProperties.hierarchySelections;
    }
    return [{ key: 'Internal Use Product Configuration', formFields: [] }];
  };
  const [selections, setSelections] = useState(getDefaultSelection());

  const [stateUpdated, setStateUpdated] = useState(false);

  const checkActuatorTypeComponent = (selections) => {
    const findIndex = selections.findIndex(
      (item) =>
        item.key === 'Motion Actuator' || item.value === 'Motion Actuator'
    );
    return findIndex > -1;
  };

  useEffect(() => {
    handleItemUpdate({
      hierarchySelections: selections,
      is_actuator_type: checkActuatorTypeComponent(selections)
    });
  }, [stateUpdated]);

  useEffect(() => {
    setHierarchyDropdownList(get(internalProductConfig, 'hierarchySchema', []));
    setCriteriaForms(get(internalProductConfig, 'criteriaSchema', {}));

    if (get(currentItem, 'hierarchySelections[0]')) {
      setSelections(get(currentItem, 'hierarchySelections', []));
    }
  }, [internalProductConfig]);

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
      //console.log('Setting values', tempSelections);
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
          setSelections,
          criteriaForms
        }}
      />

      {selections.map((selectionItem) => {
        return (
          <DynamicCriteria
            form={selectionItem.form}
            setSelectedOption={setSelectedOption}
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
            {...{
              itemProperties,
              gltfjson,
              setIsCircularFaceOrEdgeSelection,
              handleRotationalAxisChange,
              kinematicItemList,
              setKinematicItemList,
              selected3JSData
            }}
          />
        );
      })}
    </>
  );
}
