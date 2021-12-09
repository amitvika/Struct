import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const Headding = ({ as, children, className, onClick, title, style }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Typography
      variant={as}
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
