import React from 'react';

import { Link as RouterLink, useHistory } from 'react-router-dom';
import Logo from '../../assets/images/transparent_logo.png';
import {
  AppBar,
  Toolbar,
  Typography,
  useMediaQuery,
  useScrollTrigger,
  Slide
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { useStyles } from './Header.style';
import HeaderMobileView from './HeaderMobileView';
import HeaderDesktopView from './HeaderDesktopView';
import { AuthContext } from '../../context/AuthContext';

function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction={'down'} in={!trigger}>
      {children}
    </Slide>
  );
}

export default function Header(props) {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { authUser, setAuthUser } = React.useContext(AuthContext);

  const handleLogout = () => {
    setAuthUser({ user: {}, isAuthenticated: false });
    history.replace('/');
  };

  return (
    <HideOnScroll {...props}>
      <AppBar className={classes.header}>
        <Toolbar className={classes.toolbar}>
          <StructLogo />
          {isMobile ? (
            <HeaderMobileView {...{ handleLogout }} />
          ) : (
            <HeaderDesktopView {...{ handleLogout }} />
          )}
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
}

const StructLogo = () => {
  const classes = useStyles();

  return (
    <Typography
      to={'/omnidesign'}
      component={RouterLink}
      className={classes.logo}
    >
      <div
        className="d-inline-block align-top"
        style={{ display: 'flex' }}
        // onClick={handleOmniClick}
      >
        <img src={Logo} alt="logo" style={{ width: '100px' }} />
      </div>
    </Typography>
  );
};
