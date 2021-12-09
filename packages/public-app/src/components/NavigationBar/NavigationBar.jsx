import React, { useState } from 'react';
import { Link, NavLink, withRouter } from 'react-router-dom';
import Routes from '../../Routes';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Theme } from '@mui/material/styles';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import {
  Paper,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  MenuList,
  MenuItem,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LoginPopup from '../LoginPopup';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import Popover from '@mui/material/Popover';

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
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              size="large">
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
                    <LoginPopup popupState={popupState} />
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
                  <Paper>
                    <MenuItem style={{
                      textAlign: "center",
                    }}
                      selected={activeRoute(prop.path)}>

                      <ListItemText primary={prop.sidebarName} />
                    </MenuItem>
                  </Paper>
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