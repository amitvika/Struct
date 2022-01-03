import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useStyles } from './Header.style';
import { Typography, Button } from '@mui/material';
import StructLogo from '../../assets/header_struct_white.png';
import OmniDesignLogo from '../../assets/omni_design.png';

export default function LogoComponent({ handleLogoClick }) {
  const classes = useStyles();

  return (
    <Typography
      component={handleLogoClick ? Button : RouterLink}
      className={classes.logo}
      {...(handleLogoClick
        ? {
            onClick: handleLogoClick
          }
        : {
            to: '/'
          })}
    >
      <div className="d-inline-block align-top" style={{ display: 'flex' }}>
        {/* <img
          src={isInternalApp ? StructLogo : OmniDesignLogo}
          alt="logo"
          width={isInternalApp ? '180px' : '100%'}
          height={isInternalApp ? '40px' : '50px'}
          style={{ objectFit: isInternalApp ? 'contain' : 'cover' }}
        /> */}
        <img
          src={StructLogo}
          alt="logo"
          width={'180px'}
          height={'40px'}
          style={{ objectFit: 'contain' }}
        />
      </div>
    </Typography>
  );
}
