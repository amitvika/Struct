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

import { withStyles } from '@material-ui/core/styles';

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

const AppNavbar = () => {
  const dispatch = useDispatch();
  const history = useHistory();

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
          {/* <NavLink
            className="navbar-text"
            to='/process-groups'
            tag={RRNavLink}
          >
            Process Groups
            </NavLink> */}

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
                className="navbar-text mt-2 mr-1"
                to='/configuration-history'
                tag={RRNavLink}>
                Configuration History
                </NavLink>
              <NavLink className="navbar-text mt-2 mr-1 disabled">|</NavLink>
            </div>

            <UncontrolledDropdown nav inNavbar className="navbar-text">
              <DropdownToggle nav caret>
                {isAuthenticated
                  ? `Logged in as: ${user.email}`
                  : "Not logged in"}
              </DropdownToggle>

              <DropdownMenu>

                {user && user.userAccess && user.userAccess.access.OA_1_V && (
                  <>
                    <DropdownItem
                      style={{ color: "black" }}
                      onClick={() => history.push('/access-setup')}>
                      Access Setup
                  </DropdownItem>
                    <DropdownItem divider />
                  </>
                )}

                <DropdownItem
                  style={{ color: "black" }}
                  onClick={() => history.push('/view-access')}>
                  View Access
                    </DropdownItem>
                <DropdownItem divider />

                <DropdownItem toggle={false} >
                  <Switch checked={lightThemeSelected} onChange={handleThemeChange} name="currentTheme" />
                  {lightThemeSelected ? 'Dark' : 'Light'}
                </DropdownItem>

                <DropdownItem divider />


                {isAuthenticated ? authLinks : guestLinks}
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </Collapse>
      </Navbar>
    </div >
  );
}
export default AppNavbar;
