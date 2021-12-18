import React, { useRef, useState, useContext } from 'react';
import { useHistory, useLocation, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import {
  Button,
  MenuList,
  MenuItem,
  Paper,
  Tooltip,
  Menu
} from '@mui/material';

import { useStyles } from './Header.style';
import { AuthContext } from '../../context/AuthContext';
import LogoComponent from './LogoComponent';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { ColorModeContext } from '../../themes/ColorModeContextProvider';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Avatar from '@mui/material/Avatar';

export default function HeaderDesktopView({
  handleLogout,
  headerListItem = [],
  secondHeaderList = [],
  dropdownList = [],
  isInternalApp
}) {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);

  const classes = useStyles();
  const location = useLocation();

  const history = useHistory();
  const anchorRef = useRef(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const [open, setOpen] = useState(false);

  const {
    authUser: { isAuthenticated, user }
  } = useContext(AuthContext);

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
    handleCloseUserMenu();
    history.push(path);
  };

  const handleListKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    }
  };

  const getMenuButtons = (list) => {
    let menuItems = list.map(({ label, href, addSeparator, target, rel }) => {
      return (
        <li
          key={`primary_button_${label}`}
          className={
            classes.primaryListItemHeader +
            ` ${addSeparator && classes.verticalBar}`
          }
        >
          <Button
            onClick={() => {
              if (target) {
                window.open(`${href}`, '_blank');
              }
            }}
            {...{
              key: label,
              color: 'inherit',
              to: href,
              component: RouterLink,
              target,
              rel,
              className:
                classes.menuButton +
                ` ${location.pathname.includes(href) && classes.linkSelected}`
            }}
          >
            {label}
          </Button>
        </li>
      );
    });
    return menuItems;
  };

  const handleOpenUserMenu = (event) => {
    if (isAuthenticated) {
      setAnchorElUser(event.currentTarget);
    } else {
      handleLogout();
    }
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const getSecondMenu = () => {
    let menuItems = [];

    menuItems = getMenuButtons(secondHeaderList);

    // menuItems.push(
    //   <li>
    //     <Button
    //       key="user_profile"
    //       ref={anchorRef}
    //       aria-controls={open ? 'menu-list-grow' : undefined}
    //       aria-haspopup="true"
    //       onClick={handleToggle}
    //       style={{ color: 'white' }}
    //       className={classes.menuButton}
    //     >
    //       {isAuthenticated ? `Welcome: ${user.email}` : 'Login'}
    //     </Button>
    //   </li>
    // );

    menuItems.push(
      <li>
        <IconButton
          sx={{ ml: 1 }}
          onClick={colorMode.toggleColorMode}
          color="inherit"
        >
          {theme.palette.mode === 'dark' ? (
            <Brightness7Icon />
          ) : (
            <Brightness4Icon />
          )}
        </IconButton>
      </li>
    );

    menuItems.push(
      <li>
        <Tooltip title={isAuthenticated ? 'Open settings' : 'Go To Login Page'}>
          <Button
            onClick={handleOpenUserMenu}
            sx={{ p: 0, color: 'white' }}
            className={classes.menuButton}
          >
            {isAuthenticated ? `Welcome: ${user.email}` : 'Login'}
          </Button>
        </Tooltip>

        <Menu
          sx={{ mt: '45px' }}
          id="menu-appbar"
          anchorEl={anchorElUser}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
        >
          <MenuItem
            key={`user_setup_link`}
            onClick={() => handleLink('/administrative')}
          >
            Administrative
          </MenuItem>

          <MenuItem key={`logout_link`} onClick={handleLogout}>
            Logout
          </MenuItem>
        </Menu>
      </li>
    );

    menuItems.push(
      <li style={{ marginLeft: 10 }}>
        <Tooltip title="Open settings">
          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
            <Avatar alt={'Hello'} src="/static/images/avatar/2.jpg" />
          </IconButton>
        </Tooltip>
      </li>
    );

    if (dropdownList.length === 0) {
      return menuItems;
    }

    // menuItems.push(
    //   <Popper
    //     key={`popper_admin_options`}
    //     open={open}
    //     anchorEl={anchorRef.current}
    //     role={undefined}
    //     transition
    //     disablePortal
    //   >
    //     {({ TransitionProps, placement }) => (
    //       <Grow
    //         {...TransitionProps}
    //         style={{
    //           transformOrigin:
    //             placement === 'bottom' ? 'center top' : 'center bottom'
    //         }}
    //       >
    //         <Paper>
    //           <ClickAwayListener onClickAway={handleClose}>
    //             <MenuList
    //               autoFocusItem={open}
    //               id="menu-list-grow"
    //               onKeyDown={handleListKeyDown}
    //             >
    //               <MenuItem
    //                 key={`user_setup_link`}
    //                 onClick={() => handleLink('/administrative')}
    //               >
    //                 Administrative
    //               </MenuItem>

    //               <MenuItem key={`logout_link`} onClick={handleLogout}>
    //                 Logout
    //               </MenuItem>
    //             </MenuList>
    //           </ClickAwayListener>
    //         </Paper>
    //       </Grow>
    //     )}
    //   </Popper>
    // );

    return menuItems;
  };
  return (
    <>
      <Box component="div" className={classes.menuContainer}>
        <LogoComponent {...{ isInternalApp }} />
        <Box
          component="ul"
          key={`primary_list1`}
          className={classes.primaryListHeader}
        >
          {getMenuButtons(headerListItem)}
        </Box>
      </Box>
      <Box
        component="ul"
        key={`secondary_list1`}
        className={classes.primaryListHeader}
      >
        {getSecondMenu()}
      </Box>
    </>
  );
}
