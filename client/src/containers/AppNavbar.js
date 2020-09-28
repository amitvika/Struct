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
import { NavLink as RRNavLink } from 'react-router-dom'
import RegisterModal from "../components/auth/RegisterModal";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import StructLogo from '../assets/images/logo_white.png';
import { logout } from "../actions/authActions";
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from "react-router-dom";

const AppNavbar = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const { isAuthenticated, user } = useSelector(state => state.auth);
  const error = useSelector(state => state.error);
  const [isOpen, setIsOpen] = useState(false);
  const [msg, setMsg] = useState(null);

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
            to='/process-groups'
            tag={RRNavLink}
          >
            Process Groups
            </NavLink>

          <NavLink
            className="navbar-text"
            to='/items'
            tag={RRNavLink}
          >
            Items
            </NavLink>
        </Nav>
        <NavbarToggler onClick={toggle} />

        <Collapse isOpen={isOpen} navbar>
          <Nav className="ml-auto " navbar>
            <NavLink className="navbar-text mt-2" href="#" onClick={() => history.goBack()}>
              <ArrowBackIcon />
            </NavLink>
            <NavLink className="navbar-text mt-2 mr-2" href="#" onClick={() => history.goForward()}>
              <ArrowForwardIcon />
            </NavLink>
            <NavLink className="navbar-text mt-2 mr-2 disabled">|</NavLink>

            <div>
              <NavLink
                className="navbar-text mt-2 mr-1"
                to='/configuration-history'
                tag={RRNavLink}
              >
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
