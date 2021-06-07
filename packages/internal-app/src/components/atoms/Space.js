import React from 'react';
import PropTypes from 'prop-types';

const Space = ({ size }) => (
  <div
    style={{
      height: size
    }}
  />
);

Space.propTypes = {
  size: PropTypes.number
};

export default Space;
