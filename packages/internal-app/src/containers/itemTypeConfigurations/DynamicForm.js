import React from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Headding from '@monostruct/common/components/atoms/Headding';
import Select from '@monostruct/common/components/atoms/Select';
import Input from '@monostruct/common/components/atoms/Input';

export default function DynamicCriteria({
  formFields,
  key,
  value,
  handleUpdate,
}) {
  // const [formFields, setFormFields] = useState(formFields);
  const handleOnChange = (name, value) => {
    const findIndex = formFields.findIndex(
      (fieldItem) => name === fieldItem.fieldName
    );
    let tempFields = formFields;

    tempFields[findIndex].value = value;
    handleUpdate(tempFields);
  };

  const renderFields = () => {
    return formFields.map((fieldItem) => {
      return (
        <Grid container spacing={2} key={fieldItem.fieldName}>
          <Grid item xs={4}>
            <Headding bold title={fieldItem.fieldName} />
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
