import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';

const Textarea = ({
  label, htmlFor, text, ...props
}) => {
  return (
    <div className="bdb-textarea">
      {label && <label htmlFor={htmlFor}>{label}</label>}
      <TextField
        id="outlined-multiline-static"
        multiline
        rows={4}
        variant="outlined"
        {...props}
        style={{ width: '100%' }}>{text}</TextField>
    </div>
  )
};

Textarea.propTypes = {
  htmlFor: PropTypes.string,
  label: PropTypes.string,
  text: PropTypes.string
};

Textarea.defaultProps = {
  htmlFor: 'unnamed'
};
export default Textarea;
