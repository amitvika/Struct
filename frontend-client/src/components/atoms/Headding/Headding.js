import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Headding = ({
  as, children, className, onClick, title, bold, style, fontSize, color, align
}) => {
  const Tag = as;

  return (
    <Tag
      style={{
        ...style,
        fontSize,
        color
      }}
      onClick={onClick}
      className={classNames(
        'bdb-heading',
        bold && 'bdb-heading--bold',
        onClick && 'bdb-heading--clickable',
        align && `bdb-heading--${align}`,
        className
      )}
    >
      {title || children}
    </Tag>
  );
};

Headding.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node,
  style: PropTypes.shape(),
  align: PropTypes.string,
  as: PropTypes.string,
  className: PropTypes.string,
  title: PropTypes.string,
  color: PropTypes.string,
  bold: PropTypes.bool,
  fontSize: PropTypes.number
};

Headding.defaultProps = {
  as: 'h4'
};

export default Headding;
