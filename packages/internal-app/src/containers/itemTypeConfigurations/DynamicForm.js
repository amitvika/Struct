import React, { useEffect, useState } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Headding from '@monostruct/common/components/atoms/Headding';
import Select from '@monostruct/common/components/atoms/Select';
import Input from '@monostruct/common/components/atoms/Input';
import ThreejsSelection from './ThreejsSelection';

export default function DynamicCriteria({
  formFields,
  key,
  value,
  handleUpdate,
  renderData,
  setRenderData,
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
  const [stateFormFields, setStateFormFields] = useState(formFields);

  useEffect(() => {
    setStateFormFields(formFields);
  }, [formFields]);

  const renderFields = () => {
    console.log('STATEFORMFIELDS', stateFormFields);
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
          <Grid item xs={6}>
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

            {fieldItem.fieldType === 'Custom' && (
              <ThreejsSelection
                renderData={renderData}
                setRenderData={setRenderData}
                value={fieldItem.value}
                mykey={fieldItem.fieldName}
                active={fieldItem.activeCell}
                onChange={(mykeyinfo, valuefound) => {
                  if (fieldItem.activeCell) {
                    console.log(
                      'Changing Values',
                      fieldItem,
                      mykeyinfo,
                      valuefound
                    );
                    handleOnChange(fieldItem.fieldName, valuefound);
                  } else {
                    console.log(
                      'Not Changing Values',
                      fieldItem,
                      mykeyinfo,
                      valuefound
                    );
                  }
                }}
                onClick={handleOnClick}
              />
            )}
          </Grid>
        </Grid>
      );
    });
  };

  if (!formFields || !formFields[0]) {
    return null;
  }

  return (
    <Paper style={{ padding: 20, margin: 10 }}>
      <Headding style={{ fontSize: 24 }}>{value}</Headding>
      {renderFields()}
    </Paper>
  );
}
