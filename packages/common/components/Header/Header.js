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
    <AppBar position="static" sx={{ background: '#000000' }}>
      <Toolbar className={classes.toolbar}>
        {isMobile ? (
          <HeaderMobileView {...{ handleLogout, ...props }} />
        ) : (
          <HeaderDesktopView {...{ handleLogout, ...props }} />
        )}
      </Toolbar>
    </AppBar>
  );
}
