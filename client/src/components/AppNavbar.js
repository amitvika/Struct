import React, { Component, Fragment } from "react";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import { connect } from "react-redux";
import RegisterModal from "./auth/RegisterModal";
import Logout from "./auth/Logout";
import PropTypes from "prop-types";
import { changePage } from "../actions/pageActions";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { loadUser } from "../actions/authActions";
import struct from "./Struct Logo.png";

class AppNavbar extends Component {
  state = {
    isOpen: false
  };
  componentDidUpdate() {
    //store.dispatch(loadUser()); ///using this to load users after logging in/registering.  Need to move this to actions or something
  }
  static propTypes = {
    auth: PropTypes.object.isRequired,
    changePage: PropTypes.func.isRequired
  };
  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  };
  onPageChangeClick = (navType, page) => {
    const pageDetail = {
      navType,
      page
    };
    this.props.changePage(pageDetail);
  };

  render() {
    const { isAuthenticated, user } = this.props.auth;
    const authLinks = (
      <Fragment>
        <Logout />
      </Fragment>
    );
    const guestLinks = (
      <Fragment>
        <RegisterModal />
        {/*<LoginModal />*/}
      </Fragment>
    );
    return (
      <div>
        <Navbar fixed="top" color="dark" dark expand="sm" className="mb-5">
          <NavbarBrand>
            {/* <img
              src={struct}
              width="250"
              height="30"
              className="d-inline-block align-top"
            />*/}
            Struct
          </NavbarBrand>
          <Nav className="mr-auto" navbar>
            <NavLink
              className="navbar-text"
              onClick={this.onPageChangeClick.bind(
                this,
                "MainNav",
                "ProductDesign"
              )}
              href="#"
            >
              Product Design
            </NavLink>

            <NavLink
              className="navbar-text"
              onClick={this.onPageChangeClick.bind(this, "MainNav", "Clients")}
              href="#"
            >
              Clients
            </NavLink>
            <NavLink
              className="navbar-text"
              onClick={this.onPageChangeClick.bind(this, "MainNav", "Vendors")}
              href="#"
            >
              Vendors
            </NavLink>

            <NavLink
              className="navbar-text"
              onClick={this.onPageChangeClick.bind(
                this,
                "MainNav",
                "ProcessGroups"
              )}
              href="#"
            >
              Process Groups
            </NavLink>

            <NavLink
              className="navbar-text"
              onClick={this.onPageChangeClick.bind(this, "MainNav", "Items")}
              href="#"
            >
              Items
            </NavLink>
          </Nav>
          <NavbarToggler onClick={this.toggle} />

          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto " navbar>
              <NavLink className="navbar-text mt-2" href="#">
                <ArrowBackIcon />
              </NavLink>
              <NavLink className="navbar-text mt-2 mr-2" href="#">
                <ArrowForwardIcon />
              </NavLink>
              <NavLink className="navbar-text mt-2 mr-2 disabled">|</NavLink>

              <div>
                <NavLink
                  className="navbar-text mt-2 mr-1"
                  onClick={this.onPageChangeClick.bind(
                    this,
                    "OpsNav",
                    "ConfigurationHistory"
                  )}
                  href="#"
                >
                  Configuration History
                </NavLink>
                <NavLink className="navbar-text mt-2 mr-1 disabled">|</NavLink>
              </div>

              <UncontrolledDropdown nav inNavbar className="navbar-text">
                <DropdownToggle nav caret>
                  {isAuthenticated
                    ? `Logged in as: ${user.name}`
                    : "Not logged in"}
                </DropdownToggle>

                <DropdownMenu>
                  {this.props.auth.user && this.props.auth.user.userAccess.access.OA_1_V ? (
                    <DropdownItem
                      onClick={this.onPageChangeClick.bind(
                        this,
                        "OpsNav",
                        "AccessSetup"
                      )}
                    >
                      Access Setup
                    </DropdownItem>
                  ) : (
                      ""
                    )}

                  <DropdownItem
                    onClick={this.onPageChangeClick.bind(
                      this,
                      "OpsNav",
                      "ViewAccess"
                    )}
                  >
                    View Access
                  </DropdownItem>
                  <DropdownItem divider />
                  {isAuthenticated ? authLinks : guestLinks}
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  //this method is used to get a portion of the overall app state to use in this component
  auth: state.auth
});
export default connect(mapStateToProps, { changePage })(AppNavbar);
//export default connect(mapStateToProps, { getItems, deleteItem })(ShoppingList);
