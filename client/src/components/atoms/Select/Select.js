import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactSelect from 'react-select';

const Select = ({
  htmlFor,
  label,
  options,
  width,
  field = {},
  form = {},
  allowCustomInput = false,
  placeholder = 'Select',
  isMulti,
  onChange,
  onInputChange,
  value,
  onCustomOnChange,
  ...props
}) => {

  return (
    <div
      className="brewery-select-wrap"
      style={{
        width
      }}
    >
      <label htmlFor={htmlFor}>{label}</label>
      <ReactSelect
        {...field}
        {...props}
        onChange={onChange}
        classNamePrefix="brewery-select"
        isSearchable
        options={options}
        placeholder={placeholder || 'Select'}
        onInputChange={onInputChange}
        value={value}
      />

    </div>
  );
};

Select.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape()),
  htmlFor: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  width: PropTypes.number,
  field: PropTypes.shape(),
  form: PropTypes.shape(),
  onChange: PropTypes.func,
  onInputChange: PropTypes.func
};

Select.defaultProps = {
  htmlFor: 'unnamed',
  onChange: () => { },
  onInputChange: () => { }
};

export default Select;
