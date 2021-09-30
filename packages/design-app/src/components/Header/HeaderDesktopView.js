import React, { useRef, useState, useContext } from 'react';
import { useHistory, useLocation, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Box from '@material-ui/core/Box';
import Grow from '@material-ui/core/Grow';
import Popper from '@material-ui/core/Popper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { Button, MenuList, MenuItem, Paper } from '@material-ui/core';

import { useStyles } from './Header.style';
import { logout } from '@monostruct/internal-app/src/actions/authActions';
import { AuthContext } from '../../context/AuthContext';
import { headerListItem } from './Header.helper';

export default function HeaderDesktopView() {
  const classes = useStyles();
  const location = useLocation();

  const history = useHistory();
  const dispatch = useDispatch();
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const {
    authUser: { isAuthenticated, user },
  } = useContext(AuthContext);

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

  const getMenuButtons = () => {
    let menuItems = headerListItem.map(({ label, href }) => {
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
    <Box component="div" className={classes.menuContainer}>
      <Box component="div" key={`primary_list1`} style={{ display: 'flex' }}>
        {getMenuButtons()}
      </Box>
      <Box component="div" key={`secondary_list1`} style={{ display: 'flex' }}>
        {getSecondMenu()}
      </Box>
    </Box>
  );
}
