import React, { Component } from "react";
import { DropdownItem } from "reactstrap";
import { logout } from "../../actions/authActions";
import { connect } from "react-redux";
import PropTypes from "prop-types";
export class Logout extends Component {
  static propTypes = {
    logout: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
  };
  render() {
    const { user } = this.props.auth;
    return (
      <DropdownItem
        style={{ color: "black" }}
        onClick={this.props.logout}
        href="#"
      >
        Logout
      </DropdownItem>
    );
  }
}

const mapStateToProps = state => ({
  //this method is used to get a portion of the overall app state to use in this component
  auth: state.auth
});
export default connect(mapStateToProps, { logout })(Logout);
