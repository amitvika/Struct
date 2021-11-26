import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';

const Headding = ({ as, children, className, onClick, title, style }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Typography
      variant={as}
      gutterBottom
      onClick={onClick}
      style={{ ...style, fontSize: `${isMobile ? '20px' : ''}` }}
    >
      {title || children}
    </Typography>
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
  as: 'h6'
};

export default Headding;
