import React, { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Headding from '@monostruct/common/components/atoms/Headding';
import Select from '@monostruct/common/components/atoms/Select';
import Input from '@monostruct/common/components/atoms/Input';
import ThreejsSelection from './ThreejsSelection';
import MotionControlComponent from './MotionControlComponent';
import { Typography } from '@mui/material';
import { get } from 'lodash';

export default function DynamicCriteria({
  form,
  handleUpdate,
  renderData,
  setRenderData,
  itemProperties,
  gltfjson,
  setSelectedOption,
  setIsCircularFaceOrEdgeSelection,
  handleRotationalAxisChange,
  kinematicItemList,
  setKinematicItemList
}) {
  const handleOnChange = (name, value) => {
    const findIndex = stateFormFields.findIndex(
      (fieldItem) => name === fieldItem.fieldName
    );
    let tempFields = [...stateFormFields];
    tempFields[findIndex].value = value;
    tempFields.map((fieldItem, index) => {
      fieldItem.activeCell = index == findIndex;
    });
    //console.log('Changig fields', tempFields);
    setStateFormFields(tempFields);
    handleUpdate(tempFields);
  };
  const handleOnClick = (name) => {
    let tempFields = [...stateFormFields];
    tempFields.map((fieldItem) => {
      fieldItem.activeCell = fieldItem.fieldName == name;
    });
    setStateFormFields(tempFields);
  };

  const [stateFormFields, setStateFormFields] = useState([]);

  useEffect(() => {
    if (form) {
      //console.log('Setting form fields from form', form);
      setStateFormFields(form.fields);
    }
  }, [form]);

  const renderFields = () => {
    if (!stateFormFields) {
      return null;
    }

    return stateFormFields.map((fieldItem) => {
      return (
        <Grid container spacing={2} key={fieldItem.fieldName}>
          <Grid item xs={4}>
            <Headding
              bold
              title={`${fieldItem.fieldName} ${
                fieldItem.inputUnits ? '(' + fieldItem.inputUnits + ')' : ''
              }`}
            />
          </Grid>
          <Grid item xs={8}>
            {fieldItem.fieldType === 'Input' && (
              <Input
                placeholder="Enter"
                type={fieldItem.dataType === 'Numerical' ? 'number' : 'text'}
                onChange={(event) =>
                  handleOnChange(fieldItem.fieldName, event.target.value)
                }
                value={fieldItem.value || ''}
              />
            )}
            {fieldItem.fieldType === 'select' && (
              <Select
                placeholder="Select"
                options={fieldItem.options
                  .split('|')
                  .map((option) => ({ label: option, value: option }))}
                onChange={({ value, label }) =>
                  handleOnChange(fieldItem.fieldName, value)
                }
                value={fieldItem.value}
              />
            )}

            {fieldItem.fieldType === 'Custom' &&
              fieldItem.dataType !== 'MotionControl' && (
                <ThreejsSelection
                  renderData={renderData}
                  setRenderData={setRenderData}
                  value={fieldItem.value}
                  mykey={fieldItem.fieldName}
                  mytype={fieldItem.dataType}
                  active={fieldItem.activeCell}
                  onChange={(mykeyinfo, valuefound) => {
                    if (fieldItem.activeCell) {
                      handleOnChange(fieldItem.fieldName, valuefound);
                    }
                  }}
                  cylindrical_axis_of_rotation={
                    fieldItem.dataType === 'CircularFaceOrEdgeSelection'
                      ? get(
                          itemProperties,
                          'actuator_motion_control.cylindrical_axis_of_rotation'
                        )
                      : null
                  }
                  onClick={handleOnClick}
                  {...{
                    setIsCircularFaceOrEdgeSelection,
                    handleRotationalAxisChange
                  }}
                />
              )}

            {fieldItem.dataType === 'MotionControl' && (
              <MotionControlComponent
                {...{
                  itemId: itemProperties.id,
                  gltfjson,
                  setRenderData,
                  setSelectedOption,
                  kinematicItemList,
                  setKinematicItemList
                }}
              />
            )}
          </Grid>
        </Grid>
      );
    });
  };

  if (!form) {
    return null;
  }

  return (
    <Paper style={{ padding: 20, margin: 10 }}>
      <Typography variant="h5" gutterBottom component="div">
        {form.criteriaTitle}
      </Typography>
      {renderFields()}
    </Paper>
  );
}
