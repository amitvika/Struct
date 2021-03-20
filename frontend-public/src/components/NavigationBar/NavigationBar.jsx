import React, { useState } from 'react';
import { Link, NavLink, withRouter } from 'react-router-dom';
import Routes from '../../Routes';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  MenuList,
  MenuItem,
  ListItemText,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import LoginPopup from '../LoginPopup';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import Popover from '@material-ui/core/Popover';

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      margin: "0px",
      color: "#68696a",
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
      textAlign: "start"
    },
    drawer: {
      width: 300,
      marginTop: "64px"
    },
    fullList: {
      width: 'auto',
    },
  }),
);

const NavigationBar = (props) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);


  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  const [isOpen, setIsOpen] = useState(false);
  const toggleDrawer = (open) => (
    event
  ) => {
    if (
      event.type === 'keydown' &&
      ((event).key === 'Tab' ||
        (event).key === 'Shift')
    ) {
      return;
    }

    setIsOpen(open);
  };

  const activeRoute = (routeName) => {
    return props.location.pathname === routeName ? true : false;
  }

  return (
    <div>
      <div className={classes.root}>
        <AppBar position="fixed"  >
          <Toolbar>
            <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h3" className={classes.title}>
              {props.title}
            </Typography>
            <>
              <PopupState variant="popover" popupId="demo-popup-popover">
                {(popupState) => (
                  <div>
                    <div  {...bindTrigger(popupState)} >
                      <AccountCircleIcon style={{ color: "white" }} fontSize="large" />
                    </div>
                    <LoginPopup popupState={popupState}/>
                  </div>

                )}
              </PopupState>
            </>

          </Toolbar>
        </AppBar>
      </div>

      <Drawer classes={{ paper: classes.drawer }} open={isOpen} onClose={toggleDrawer(false)}>
        <div
          className={classes.fullList}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >

          <MenuList>
            {Routes.map((prop, key) => {
              return (
                <NavLink to={prop.path} key={key}>
                  <MenuItem style={{
                    textAlign: "center",
                  }} selected={activeRoute(prop.path)}>
                    <ListItemText primary={prop.sidebarName} />
                  </MenuItem>
                </NavLink>
              );
            })}
          </MenuList>

        </div>
      </Drawer>

    </div >

  );
};

export default withRouter(NavigationBar);