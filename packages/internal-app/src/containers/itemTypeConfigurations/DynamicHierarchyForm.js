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
      let mySelections = itemProperties.hierarchySelections;
      if (mySelections) {
        //console.log('My Selections', mySelections);
        for (let index = 0; index < mySelections.length; index++) {
          if (mySelections[index] && mySelections[index].form) {
            let tempFields = mySelections[index].form.fields;
            if (tempFields) {
              // RESET ACTIVE CELL OF 3JS SELECTIONS
              for (
                let indexField = 0;
                indexField < tempFields.length;
                indexField++
              ) {
                let fieldItem = tempFields[indexField];
                //console.log('My Selection items', fieldItem);
                if (fieldItem.activeCell) {
                  if (fieldItem.fieldType === 'Custom') {
                    fieldItem.activeCell = false;
                  }
                }
              }
            }
          }
        }
        //console.log('Setting my Selections', mySelections);
        return mySelections;
      } else {
      }
    }
    // if (get(itemProperties, 'hierarchySelections[0]')) {
    //   return itemProperties.hierarchySelections;
    // }
    return [
      { key: 'Internal Use Product Configuration', form: { fields: [] } }
    ];
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

  const getAngleOfRotationValue = (selections) => {
    let angleOfRotationValue = 0;
    const selectedMotionControl = selections.find(
      (item) => item.value === 'Motion Actuator|Rotational'
    );

    if (get(selectedMotionControl, 'form.fields')) {
      const angleOfRotationObj = selectedMotionControl.form.fields.find(
        (item) => item.fieldName === 'Angular Rotation Range'
      );

      if (get(angleOfRotationObj, 'fieldName') === 'Angular Rotation Range') {
        angleOfRotationValue = get(angleOfRotationObj, 'value');
      }
    }
    return angleOfRotationValue;
  };

  useEffect(() => {
    // syncDataWithServer(selections);
  }, [stateUpdated]);

  const syncDataWithServer = (selections) => {
    handleItemUpdate({
      actuator_motion_control: {
        ...itemProperties.actuator_motion_control,
        angle_or_distant_limit: getAngleOfRotationValue(selections)
      },
      hierarchySelections: selections,
      is_actuator_type: checkActuatorTypeComponent(selections)
    });
  };

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
      tempSelections[findIndex].form = {
        ...tempSelections[findIndex],
        form: undefined,
        fields: updatedFormFields
      };
      //console.log('Setting values', tempSelections);
      try {
        setSelections(tempSelections);
        setStateUpdated(!stateUpdated);
        syncDataWithServer(tempSelections);
      } catch (error) {
        console.log('While setting selections', error);
      }
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
              // console.log(
              //   'Doing Changes in Dynaimc Hirearchy',
              //   selectionItem.key,
              //   updatedFormFields
              // );
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
