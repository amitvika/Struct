import React, { useEffect, useState } from "react";
import {
  Collapse,
  Navbar,
  NavLink,
  NavbarToggler,
  NavbarBrand,
  Nav,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Alert
} from "reactstrap";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { purple, } from '@material-ui/core/colors';

import { useHistory, NavLink as RRNavLink } from 'react-router-dom'
import RegisterModal from "../components/auth/RegisterModal";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import StructLogo from '../assets/images/logo_white.png';

import { useDispatch, useSelector } from 'react-redux';

import { logout } from "../actions/authActions";
import { setThemeAction } from '../actions/theme.action'

import { withStyles, makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { Typography } from "@material-ui/core";

const ThemeSwitch = withStyles({
  switchBase: {
    color: purple[300],
    '&$checked': {
      color: purple[500],
    },
    '&$checked + $track': {
      backgroundColor: purple[500],
    },
  },
  checked: {},
  track: {},
})(Switch);


const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  paper: {
    marginRight: theme.spacing(2),
  },
  profile_container: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  }
}));

const AppNavbar = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const { isAuthenticated, user } = useSelector(state => state.auth);
  const themeName = useSelector(state => state.theme.curThemeName);

  const error = useSelector(state => state.error);
  const [isOpen, setIsOpen] = useState(false);
  const [msg, setMsg] = useState(null);

  const [lightThemeSelected, setLightThemeSelected] = useState(false);

  useEffect(() => {
    if (error) {
      setMsg(error.msg.msg);
      // setTimeout(() => {
      //   history.replace('/')
      // }, 2000)
    }
    else {
      setMsg(null);
    }
  }, [error]);


  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const handleThemeChange = (event) => {
    setLightThemeSelected(event.target.checked)
    if (event.target.checked) {
      dispatch(setThemeAction({ themeName: 'darkTheme' }))
    }
    else {
      dispatch(setThemeAction({ themeName: 'lightTheme' }))
    }
  };


  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  const authLinks = (
    <>
      <DropdownItem
        style={{ color: "black" }}
        onClick={() => {
          dispatch(logout());
          history.replace('/')
        }}
        href="#"
      >
        Logout
      </DropdownItem>
    </>
  );
  const guestLinks = (
    <>
      <RegisterModal />
      {/*<LoginModal />*/}
    </>
  );

  return (
    <div>

      <Navbar fixed="top" color="dark" dark expand="sm" className="mb-5">
        <NavbarBrand>
          <img
            src={StructLogo}
            width="150"
            height="30"
            className="d-inline-block align-top"
          />
          {/* Struct */}
        </NavbarBrand>
        <Nav className="mr-auto" navbar>
          <NavLink
            className="navbar-text"
            to='/product-design'
            tag={RRNavLink}>
            Product Design
            </NavLink>

          <NavLink
            className="navbar-text"
            to='/clients'
            tag={RRNavLink}
          >
            Clients
            </NavLink>
          <NavLink
            className="navbar-text"
            to='/vendors'
            tag={RRNavLink}
          >
            Vendors
            </NavLink>
          <NavLink
            className="navbar-text"
            to='/items'
            tag={RRNavLink}
          >
            Items
            </NavLink>

          <NavLink
            className="navbar-text"
            to='/factories'
            tag={RRNavLink}>
            Factories
            </NavLink>

          <NavLink className="navbar-text mr-2 disabled">|</NavLink>

          <NavLink className="navbar-text" href="#" onClick={() => history.goBack()}>
            <ArrowBackIcon />
          </NavLink>
          <NavLink className="navbar-text" href="#" onClick={() => history.goForward()}>
            <ArrowForwardIcon />
          </NavLink>
        </Nav>
        <NavbarToggler onClick={toggle} />

        <Collapse isOpen={isOpen} navbar>
          <Nav className="ml-auto " navbar>
            <div>
              <NavLink
                className="navbar-text"
                to='/configuration-history'
                tag={RRNavLink}>
                Configuration History
                </NavLink>
              <NavLink className="navbar-text disabled">|</NavLink>
            </div>

            <div className={classes.profile_container}>
              <Typography
                ref={anchorRef}
                aria-controls={open ? 'menu-list-grow' : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
                style={{ color: 'white', fontSize: 14 }}
              >
                {isAuthenticated
                  ? `Welcome: ${user.name} ${user.email}`
                  : "Not logged in"}
              </Typography>
            </div>
            <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
              {({ TransitionProps, placement }) => (
                <Grow
                  {...TransitionProps}
                  style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                >
                  <Paper>
                    <ClickAwayListener onClickAway={handleClose}>
                      <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                        {user && user.userAccess && user.userAccess.access.OA_1_V && (
                          <MenuItem onClick={() => {
                            setOpen(false);
                            history.push('/user-setup');
                          }}>User Setup</MenuItem>

                        )}
                        <MenuItem onClick={() => {
                          setOpen(false);
                          history.push('viewMyProfile');
                        }}> View My Profile</MenuItem>
                        <MenuItem>
                          <Switch checked={lightThemeSelected} onChange={handleThemeChange} name="currentTheme" />
                          {lightThemeSelected ? 'Dark' : 'Light'}
                        </MenuItem>
                        <MenuItem onClick={handleClose}>Logout</MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>

            {/* <UncontrolledDropdown nav inNavbar className="navbar-text">
              <DropdownToggle nav caret>
                {isAuthenticated
                  ? `Welcome: ${user.email}`
                  : "Not logged in"}
              </DropdownToggle>

              <DropdownMenu>

                {user && user.userAccess && user.userAccess.access.OA_1_V && (
                  <>
                    <DropdownItem
                      style={{ color: "black" }}
                      onClick={() => history.push('/user-setup')}>
                     User Setup
                  </DropdownItem>
                    <DropdownItem divider />
                  </>
                )}

                <DropdownItem
                  style={{ color: "black" }}
                  onClick={() => history.push('/view-access')}>
                  View My Profile
                    </DropdownItem>
                <DropdownItem divider />

                <DropdownItem toggle={false} >
                  <Switch checked={lightThemeSelected} onChange={handleThemeChange} name="currentTheme" />
                  {lightThemeSelected ? 'Dark' : 'Light'}
                </DropdownItem>

                <DropdownItem divider />


                {isAuthenticated ? authLinks : guestLinks}
              </DropdownMenu>
            </UncontrolledDropdown> */}
          </Nav>
        </Collapse>
      </Navbar>
    </div >
  );
}

export default AppNavbar;
