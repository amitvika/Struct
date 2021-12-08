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
import AuthService from '@monostruct/common/services/AuthServices';

const Header = (props) => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { authUser, setAuthUser } = React.useContext(AuthContext);

  React.useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const resUser = await AuthService.fetchUser();
      setAuthUser({ user: resUser, isAuthenticated: true });
    } catch (error) {
      console.log('Error', error);
    }
  };

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
};

export default React.memo(Header);
