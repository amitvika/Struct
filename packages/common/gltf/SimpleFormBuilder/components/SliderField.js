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
import Slider from '@material-ui/core/Slider';
import InputLabel from '@material-ui/core/InputLabel';
//import Grid from '@material-ui/core/Grid';
const getName = (name) => _.replace(name, /\./g, ' ');

const CustomSliderField = ({
  field,
  value,
  errors,
  onChange,
  labelwidth,
  ...others
}) => {
  const key = field.key || field.name || 'key';
  const inputKey = `form-${key}`;
  const name = field.name || 'field';
  const disabled = field.disabled || false;
  const helpertext = field.helpertext || '';
  const type = field.auto || 'auto';
  const step = field.step || 1;
  const min = field.min || 0;
  const max = field.max || 100;
  let errorText = _.get(errors, key, false);
  let currentlabelwidth = labelwidth || 0;
  currentlabelwidth = 5;
  const textwidth = 100 - currentlabelwidth;
  currentlabelwidth = textwidth;
  return (
    // <Grid style={{display:"flex"}}>
    <span>
      {currentlabelwidth != 0 && (
        <InputLabel style={{ width: currentlabelwidth.toString() + '%' }}>
          {getName(name)}
        </InputLabel>
      )}
      <Slider
        zindex="tooltip"
        style={{ width: textwidth.toString() + '%' }}
        {...field}
        key={inputKey}
        valueLabelDisplay={type}
        placeholder={getName(name)}
        label={getName(name)}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        step={step}
        min={min}
        max={max}
        {...others}
      />
    </span>
  );
};

CustomSliderField.defaultProps = {
  errors: {}
};

CustomSliderField.propTypes = {
  onChange: func.isRequired,
  field: shape({
    name: string,
    auto: oneOf(['auto', 'none']),
    key: string,
    disabled: bool
  }).isRequired,
  value: oneOfType([string, number, array]),
  errors: shape({})
};

export default CustomSliderField;
