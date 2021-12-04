import React, { useRef, useState, useContext } from 'react';
import { useHistory, useLocation, Link as RouterLink } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import Grow from '@material-ui/core/Grow';
import Popper from '@material-ui/core/Popper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { Button, MenuList, MenuItem, Paper } from '@material-ui/core';
import Switch from '@material-ui/core/Switch';

import { useStyles } from './Header.style';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '@monostruct/common/themes/ThemeContextProvider';
import LogoComponent from './LogoComponent';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';

export default function HeaderDesktopView({
  handleLogout,
  headerListItem = []
}) {
  const theme = useTheme();
  const { themeName, setThemeName } = React.useContext(ThemeContext);

  const classes = useStyles();
  const location = useLocation();

  const history = useHistory();
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const {
    authUser: { isAuthenticated, user }
  } = useContext(AuthContext);

  const handleThemeChange = (event) => {
    setThemeName(themeName === 'darkTheme' ? 'lightTheme' : 'darkTheme');
  };

  const handleToggle = () => {
    if (isAuthenticated) {
      setOpen((prevOpen) => !prevOpen);
    } else {
      handleLogout();
    }
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

  const getMenuButtons = () => {
    let menuItems = headerListItem.map(
      ({ label, href, addSeparator, target }) => {
        return (
          <li
            key={`primary_button_${label}`}
            className={
              classes.primaryListItemHeader +
              ` ${addSeparator && classes.verticalBar}`
            }
          >
            <Button
              {...{
                key: label,
                color: 'inherit',
                to: href,
                component: RouterLink,
                target,
                className:
                  classes.menuButton +
                  ` ${location.pathname.includes(href) && classes.linkSelected}`
              }}
            >
              {label}
            </Button>
          </li>
        );
      }
    );
    return menuItems;
  };
  const getSecondMenu = () => {
    let menuItems = [];

    menuItems.push(
      <IconButton sx={{ ml: 1 }} onClick={handleThemeChange} color="inherit">
        {themeName === 'darkTheme' ? <Brightness4Icon /> : <Brightness7Icon />}
      </IconButton>
    );

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
        {isAuthenticated ? `Welcome: ${user.email}` : 'Not logged in5500--=='}
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
                placement === 'bottom' ? 'center top' : 'center bottom'
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
                    className={classes.menuButton}
                  >
                    My Profile
                  </MenuItem>
                  {/* <MenuItem key={`theme_changer`}>
                    <Switch
                      checked={themeName === 'darkTheme'}
                      onChange={handleThemeChange}
                      name="currentTheme"
                    />
                    {themeName === 'darkTheme' ? 'Dark' : 'Light'}
                  </MenuItem> */}

                  <MenuItem
                    key={`logout_link`}
                    onClick={handleLogout}
                    className={classes.menuButton}
                  >
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
    <>
      <Box component="div" className={classes.menuContainer}>
        <LogoComponent />
        <Box
          component="ul"
          key={`primary_list1`}
          className={classes.primaryListHeader}
        >
          {getMenuButtons()}
        </Box>
      </Box>
      <Box component="div" key={`secondary_list1`} style={{ display: 'flex' }}>
        {getSecondMenu()}
      </Box>
    </>
  );
}
