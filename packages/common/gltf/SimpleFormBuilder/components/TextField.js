import React from 'react';
import _ from 'lodash';
import {
  number,
  func,
  shape,
  string,
  array,
  bool,
  oneOfType,
  oneOf
} from 'prop-types';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
//import Grid from '@material-ui/core/Grid';

const getName = (name) => _.replace(name, /\./g, ' ');

const CustomTextField = ({
  field,
  value,
  errors,
  onChange,
  multiline,
  labelwidth,
  ...others
}) => {
  const key = field.key || field.name || 'key';
  const inputKey = `form-${key}`;
  const name = field.name || 'field';
  const disabled = field.disabled || false;
  const helpertext = field.helpertext || '';
  const type = field.type || 'text';
  let currentlabelwidth = labelwidth || 0;
  currentlabelwidth = 0;
  const textwidth = 100 - currentlabelwidth;
  currentlabelwidth = textwidth;
  let errorText = _.get(errors, key, false);

  return (
    // <Grid style={{display:"flex"}}>
    <span>
      {currentlabelwidth != 0 && (
        <InputLabel style={{ width: currentlabelwidth.toString() + '%' }}>
          {getName(name)}
        </InputLabel>
      )}
      <TextField
        zindex="tooltip"
        {...field}
        key={inputKey}
        type={type}
        placeholder={currentlabelwidth == 0 ? getName(name) : ''}
        helperText={errorText ? errorText : helpertext}
        label={currentlabelwidth == 0 ? getName(name) : ''}
        error={!!errorText}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        multiline={multiline}
        fullWidth
        {...others}
        style={{ width: textwidth.toString() + '%' }}
        InputProps={{
          style: multiline ? { minHeight: '36px' } : { height: '36px' }
        }}
      />
    </span>
  );
};

CustomTextField.defaultProps = {
  errors: {},
  multiline: false
};

CustomTextField.propTypes = {
  onChange: func.isRequired,
  field: shape({
    name: string,
    type: oneOf(['text', 'select', 'multiLineText', 'number', 'password']),
    key: string,
    disabled: bool
  }).isRequired,
  value: oneOfType([string, number, array]),
  errors: shape({}),
  multiline: bool
};

export default CustomTextField;
