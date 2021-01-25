import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';

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
  const selectStyles = { menu: styles => ({ ...styles, zIndex: 999 }) };

  return (
    <div
      className="brewery-select-wrap"
      style={{
        width
      }}
    >
      {label && <label htmlFor={htmlFor}>{label}</label>}
      <ReactMultiSelectCheckboxes
        classNamePrefix="brewery-select"
        options={options}
        onChange={onChange}
        placeholderButtonLabel={placeholder || 'Select'}
        value={value}
        styles={selectStyles}
        getDropdownButtonLabel={({ placeholderButtonLabel, value }) => {
          return placeholder
        }}
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
