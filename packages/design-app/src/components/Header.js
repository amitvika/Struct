import React, { useRef, useState, useContext } from 'react';

import { AppBar, Toolbar, makeStyles, Paper } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grow from '@material-ui/core/Grow';
import Popper from '@material-ui/core/Popper';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Switch from '@material-ui/core/Switch';
import Box from '@material-ui/core/Box';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@monostruct/internal-app/src/actions/authActions';
import { useHistory } from 'react-router-dom';
import { setThemeAction } from '@monostruct/internal-app/src/actions/theme.action';

import { AuthContext } from '../context/AuthContext';

const useStyles = makeStyles((theme) => ({
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  header: {
    ...theme.header,
    backgroundColor: '#1e1d1e',
    paddingRight: '50px',
    paddingLeft: '50px',
    // position: 'sticky'
  },
  logo: {
    fontWeight: 600,
    color: '#FFFEFE',
    textAlign: 'left',
  },
  menuButton: {
    ...theme.menuButton,
    marginRight: '0px',
  },
  menuContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  linkSelected: {
    background: '#5D6D7E',
    color: '#ffffff',
  },
}));

export default function Header() {
  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const {
    authUser: { isAuthenticated, user },
  } = useContext(AuthContext);
  const [lightThemeSelected, setLightThemeSelected] = useState(false);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };
  const handleLogout = () => {
    dispatch(logout());
    history.replace('/');
  };
  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };
  const handleLink = (path) => {
    setOpen(false);
    history.push(path);
  };
  const handleListKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    }
  };
  const handleThemeChange = (event) => {
    setLightThemeSelected(event.target.checked);
    if (event.target.checked) {
      dispatch(setThemeAction({ themeName: 'darkTheme' }));
    } else {
      dispatch(setThemeAction({ themeName: 'lightTheme' }));
    }
  };

  const displayDesktop = () => {
    return (
      <Toolbar className={classes.toolbar}>
        {structLogo}
        <Box component="div" className={classes.menuContainer}>
          <Box
            component="div"
            key={`primary_list1`}
            style={{ display: 'flex' }}
          >
            {getMenuButtons()}
          </Box>
          <Box
            component="div"
            key={`secondary_list1`}
            style={{ display: 'flex' }}
          >
            {getSecondMenu()}
          </Box>
        </Box>
      </Toolbar>
    );
  };

  const structLogo = (
    <Typography
      to={'/omnidesign'}
      component={RouterLink}
      className={classes.logo}
    >
      <div
        className="d-inline-block align-top"
        style={{ width: '150', height: '30', fontSize: 'x-large' }}
        // onClick={handleOmniClick}
      >
        OMNIDESIGN
      </div>
    </Typography>
  );

  const getMenuButtons = () => {
    let menuItems = headersData.map(({ label, href }) => {
      return (
        <Button
          key={`primary_button_${label}`}
          {...{
            key: label,
            color: 'inherit',
            to: href,
            component: RouterLink,
            className:
              classes.menuButton +
              ` ${location.pathname.includes(href) && classes.linkSelected}`,
          }}
        >
          {label}
        </Button>
      );
    });
    return menuItems;
  };
  const getSecondMenu = () => {
    let menuItems = [];

    menuItems.push(
      <Button
        key="user_profile"
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        style={{ color: 'white' }}
        className={classes.menuButton}
      >
        {isAuthenticated
          ? `Welcome: ${user.name} ${user.email}`
          : 'Not logged in'}
      </Button>
    );

    menuItems.push(
      <Popper
        key={`popper_admin_options`}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={open}
                  id="menu-list-grow"
                  onKeyDown={handleListKeyDown}
                >
                  <MenuItem
                    key={`user_setup_link`}
                    onClick={() => handleLink('/my_profile')}
                  >
                    My Profile
                  </MenuItem>
                  {/* <MenuItem key={`theme_changer`}>
                    <Switch
                      checked={lightThemeSelected}
                      onChange={handleThemeChange}
                      name="currentTheme"
                    />
                    {lightThemeSelected ? 'Dark' : 'Light'}
                  </MenuItem> */}

                  <MenuItem key={`logout_link`} onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    );

    return menuItems;
  };

  return (
    <header>
      <AppBar className={classes.header}>{displayDesktop()}</AppBar>
    </header>
  );
}

const headersData = [
  {
    label: 'All Designs',
    href: '/design',
  },
  {
    label: 'Product Maker',
    href: '/product',
  },
  {
    label: 'CAD Based Design',
    href: '/cad',
  },
  {
    label: 'PCB',
    href: '/pcb',
  },
  {
    label: 'Silicon',
    href: '/silicon',
  },
  {
    label: 'Clothes',
    href: '/clothes',
  },
  {
    label: 'Architecture',
    href: '/architecture',
  },
  // {
  //   label: "Predesigned Components",
  //   href: "/predesigned",
  // },
  {
    label: 'UI/UX and App Designer',
    href: '/appdesigner',
  },
  {
    label: 'Machines and Tools',
    // href: "/design?type=app-designer"
  },
];
