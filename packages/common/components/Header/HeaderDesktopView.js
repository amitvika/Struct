import React, { useRef, useState, useContext } from 'react';
import { useHistory, useLocation, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import { Button, MenuItem, Tooltip, Menu } from '@mui/material';

import { useStyles } from './Header.style';
import { AuthContext } from '../../context/AuthContext';
import LogoComponent from './LogoComponent';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { ColorModeContext } from '../../themes/ColorModeContextProvider';
import Avatar from '@mui/material/Avatar';
import Grow from '@mui/material/Grow';
import { deleteFromLocalStorage } from '../../utils/usefulHelpers';

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
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const {
    authUser: { isAuthenticated, user }
  } = useContext(AuthContext);

  const handleLink = (path) => {
    handleCloseUserMenu();
    history.push(path);
  };

  const [checked, setChecked] = React.useState(false);

  const handleChange = () => {
    setChecked((prev) => !prev);
  };

  const getMenuButtons = (list) => {
    let menuItems = list.map(
      ({
        label,
        href,
        addSeparator = false,
        target,
        rel,
        showOnHover,
        hoverMenuHandler,
        hoverMenuLabel,
        isCustomComponent,
        Component
      }) => {
        if (isCustomComponent) {
          return (
            <li
              key={`primary_button_${label}`}
              className={
                classes.primaryListItemHeader +
                ` ${addSeparator && classes.verticalBar}`
              }
            >
              <Component />
            </li>
          );
        }

        const childItem = (
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

        if (hoverMenuHandler) {
          return (
            <li
              key={`primary_button_${label}`}
              className={
                classes.primaryListItemHeader +
                ` ${addSeparator && classes.verticalBar}`
              }
              // style={{ display: `${checked ? 'none' : 'block'}` }}
              color={'inherit'}
            >
              {!checked ? (
                <Button
                  onMouseEnter={() => setChecked(true)}
                  className={classes.menuButton}
                  sx={{ color: 'unset' }}
                >
                  {hoverMenuLabel}
                </Button>
              ) : (
                <Grow
                  in={checked}
                  style={{ transformOrigin: '0 1 1' }}
                  {...(checked ? { timeout: 1000 + 0 * 50 } : {})}
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
                        ` ${
                          location.pathname.includes(href) &&
                          classes.linkSelected
                        }`
                    }}
                  >
                    {label}
                  </Button>
                </Grow>
              )}
            </li>
          );
        }

        if (!showOnHover) {
          return childItem;
        }

        return (
          <Grow
            in={checked}
            style={{ transformOrigin: '0 1 1' }}
            {...(checked ? { timeout: 1000 + 0 * 50 } : {})}
          >
            {childItem}
          </Grow>
        );
      }
    );
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

    menuItems.push(
      <li key={'second_menu_theme'}>
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
      <li key={'second_menu_setting'}>
        <Tooltip title={isAuthenticated ? 'Open settings' : 'Go To Login Page'}>
          <Button
            onClick={handleOpenUserMenu}
            sx={{ p: 0, color: 'white' }}
            className={classes.menuButton}
          >
            {isAuthenticated ? `Welcome: ${user ? user.email : ''}` : 'Login'}
          </Button>
        </Tooltip>

        {isAuthenticated && (
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
        )}
      </li>
    );

    if (isAuthenticated) {
      menuItems.push(
        <li key={'second_avatar'} style={{ marginLeft: 10 }}>
          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt={'Hello'} src="/static/images/avatar/2.jpg" />
            </IconButton>
          </Tooltip>
        </li>
      );
    }

    if (dropdownList.length === 0) {
      return menuItems;
    }

    return menuItems;
  };
  return (
    <>
      <Box
        component="div"
        className={classes.menuContainer}
        onMouseLeave={() => setChecked(false)}
      >
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
