import React, { useState } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

// placeholder
const Input = ({
  disabled, label, htmlFor, size, width, rounded, field = {}, type, containerStyle, rightLabel, ...props
}) => {
  // state
  const [isPasswordVisible, togglePassword] = useState(false);

  return (
    <div
      className={classNames('bdb-input', rounded && 'bdb-input--rounded', size && `bdb-input--${size}`)}
      style={{
        maxWidth: width,
        ...containerStyle
      }}
    >
      {label && (
        <label className={`input-field-label ${disabled ? 'disabled' : ''}`} htmlFor={htmlFor}>
          <span>{label}</span>
          {type === 'password' && (
            <span onClick={() => togglePassword(!isPasswordVisible)} className="show-password-button">
              {isPasswordVisible ? 'Hide Password' : 'Show Password'}
            </span>
          )}
        </label>
      )}
      <span className="inp-field-cont">
        <input
          className={rightLabel && 'padding-right-input'}
          {...field}
          {...props}
          type={type === 'password' ? (isPasswordVisible ? 'text' : 'password') : type}
          disabled={disabled}
        />
        {rightLabel && <div className="input-right-label">{rightLabel}</div>}
      </span>
    </div>
  );
};

Input.propTypes = {
  htmlFor: PropTypes.string,
  label: PropTypes.string,
  size: PropTypes.string,
  width: PropTypes.string,
  rounded: PropTypes.bool,
  field: PropTypes.shape()
};

Input.defaultProps = {
  htmlFor: 'unnamed'
};

export default Input;
