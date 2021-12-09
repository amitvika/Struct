import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useStyles } from './Header.style';
import { Typography } from '@mui/material';
import StructLogo from '../../assets/header_struct_white.png';
import OmniDesignLogo from '../../assets/omni_design.png';

export default function LogoComponent({ isInternalApp }) {
  const classes = useStyles();

  return (
    <Typography to={'/'} component={RouterLink} className={classes.logo}>
      <div className="d-inline-block align-top" style={{ display: 'flex' }}>
        <img
          src={isInternalApp ? StructLogo : OmniDesignLogo}
          alt="logo"
          width="150"
          height="30"
        />
      </div>
    </Typography>
  );
}
