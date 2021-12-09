import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ButtonUI from '@mui/material/Button';

const Button = ({
  children,
  reddyBrown,
  logixBlue,
  seafoamBlue,
  green,
  rounded,
  bold,
  size,
  full,
  additionalClassName,
  ...props
}) => (
  <ButtonUI
    className={classNames(
      'brewery-button',
      reddyBrown && 'brewery-button--reddy-brown',
      logixBlue && 'brewery-button--blue',
      seafoamBlue && 'brewery-button--seafoam-blue',
      green && 'brewery-button--green',
      props.disabled && 'brewery-button--disabled',
      rounded && 'brewery-button--rounded',
      bold && 'brewery-button--bold',
      full && 'brewery-button--full',
      size && `brewery-button--size-${size}`,
      additionalClassName || ''
    )}
    variant="contained"
    {...props}
  >
    {children}
  </ButtonUI>
);

Button.propTypes = {
  children: PropTypes.node,
  reddyBrown: PropTypes.bool,
  green: PropTypes.bool,
  logixBlue: PropTypes.bool,
  seafoamBlue: PropTypes.bool,
  rounded: PropTypes.bool,
  bold: PropTypes.bool,
  size: PropTypes.string,
  full: PropTypes.bool
};

export default Button;
