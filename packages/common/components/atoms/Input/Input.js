import React, { useState } from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';
import withStyles from '@mui/styles/withStyles';
import TextField from '@mui/material/TextField';

const useStyles = makeStyles((theme) => ({
  textFieldContainer: {
    width: '100%',
    '& p':{
      marginLeft:0,
    }
  },
}));

// placeholder
const InputComponent = ({
  disabled,
  label,
  htmlFor,
  size,
  width,
  rounded,
  field = {},
  type,
  containerStyle,
  isRequired = false,
  hasError = false,
  ...props
}) => {
  const classes = useStyles();

  return (
    <TextField
      variant="outlined"
      className={classes.textFieldContainer}
      {...field}
      {...props}
      type={
        type === 'password' ? (isPasswordVisible ? 'text' : 'password') : type
      }
      disabled={disabled}
      style={{ width: '100%' }}
      error={hasError}
      helperText={hasError && "This is required!"}
    />
  );
};

InputComponent.propTypes = {
  htmlFor: PropTypes.string,
  label: PropTypes.string,
  size: PropTypes.string,
  width: PropTypes.string,
  rounded: PropTypes.bool,
  field: PropTypes.shape()
};

InputComponent.defaultProps = {
  htmlFor: 'unnamed'
};

export default InputComponent;
