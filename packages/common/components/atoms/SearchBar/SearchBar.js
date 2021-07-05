import React from 'react';
import PropTypes from 'prop-types';

const SearchBar = ({
  htmlFor, label, placeholder, onChange
}) => (
  <div className="brewery-search">
    {label && <label htmlFor={htmlFor}>{label}</label>}
    <input type="text" placeholder={placeholder || 'Search Bar…'} onChange={onChange} />
  </div>
);

SearchBar.propTypes = {
  htmlFor: PropTypes.string,
  label: PropTypes.string
};

SearchBar.defaultProps = {
  htmlFor: 'unnamed'
};

export default SearchBar;
