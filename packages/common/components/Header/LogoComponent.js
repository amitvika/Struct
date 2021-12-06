import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useStyles } from './Header.style';
import Logo from '../../assets/transparent_logo.png';
import { IconButton, Typography, Menu, MenuItem } from '@mui/material';

export default function LogoComponent() {
  const classes = useStyles();

  return (
    <Typography to={'/'} component={RouterLink} className={classes.logo}>
      <div className="d-inline-block align-top" style={{ display: 'flex' }}>
        <img src={Logo} alt="logo" style={{ width: '100px' }} />
      </div>
    </Typography>
  );
}
