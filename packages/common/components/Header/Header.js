import React from 'react';

import { useHistory } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  useMediaQuery,
  useScrollTrigger,
  Slide
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { authUser, setAuthUser } = React.useContext(AuthContext);

  const handleLogout = () => {
    setAuthUser({ user: {}, isAuthenticated: false });
    history.replace('/');
  };

  return (
    <HideOnScroll {...props}>
      <AppBar className={classes.header}>
        <Toolbar className={classes.toolbar}>
          {isMobile ? (
            <HeaderMobileView {...{ handleLogout, ...props }} />
          ) : (
            <HeaderDesktopView {...{ handleLogout, ...props }} />
          )}
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
}
