import React from 'react';
import PropTypes from 'prop-types';

const Textarea = ({
  label, htmlFor, text, ...props
}) =>{ 
  return(
    <div className="bdb-textarea">
    {label && <label htmlFor={htmlFor}>{label}</label>}
    <textarea {...props}>{text}</textarea>
  </div>
)};

Textarea.propTypes = {
  htmlFor: PropTypes.string,
  label: PropTypes.string,
  text: PropTypes.string
};

Textarea.defaultProps = {
  htmlFor: 'unnamed'
};
export default Textarea;
