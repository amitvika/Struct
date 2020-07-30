import React, { Component } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
  DropdownItem
} from "reactstrap";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { login, loadUser } from "../../actions/authActions";
import { clearErrors } from "../../actions/errorActions";
import store from "../../store";

class LoginModal extends Component {
  state = {
    modal: false,
    email: "",
    password: "",
    msg: null
  };
  static propTypes = {
    ///what is the reason to use props???? why not state.  Like i get it for functiosn by why for vairables?
    isAutheticated: PropTypes.bool,
    error: PropTypes.object.isRequired,
    login: PropTypes.func.isRequired,
    clearErrors: PropTypes.func.isRequired
  };
  componentDidUpdate(prevProps) {
    const { error, isAutheticated } = this.props;
    if (error !== prevProps.error) {
      //check for register error
      if (error.id === "LOGIN_FAIL") {
        this.setState({ msg: error.msg.msg });
      } else {
        this.setState({ msg: null });
      }
    }
    if (this.state.modal) {
      if (isAutheticated) {
        this.toggle();
      }
    }
  }
  toggle = () => {
    this.props.clearErrors();
    this.setState({
      modal: !this.state.modal
    });
  };
  onSubmit = e => {
    e.preventDefault();
    const { email, password } = this.state;
    const user = {
      email,
      password
    };
    //Attempt to register

    const loginLoad = (user, callback) => {
      //console.log(user);
      this.props.login(user);
      callback();
    };
    const callLoadUser = () => {
      //try doing a delay here?
      //store.dispatch(loadUser());
    };

    loginLoad(user, callLoadUser);
  };

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    return (
      <div>
        <DropdownItem style={{ color: "black" }} onClick={this.toggle} href="#">
          Login
        </DropdownItem>
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>Login</ModalHeader>
          <ModalBody>
            {this.state.msg ? (
              <Alert color="danger">{this.state.msg}</Alert>
            ) : null}
            <Form onSubmit={this.onSubmit}>
              <FormGroup>
                <Label for="email">Email</Label>
                <Input
                  type="email"
                  name="email" //has to match the name of the variable in the state
                  id="email"
                  placeholder="Email"
                  onChange={this.onChange}
                  className="mb-3"
                />
                <Label for="password">Password</Label>
                <Input
                  type="password"
                  name="password" //has to match the name of the variable in the state
                  id="password"
                  placeholder="Password"
                  onChange={this.onChange}
                  className="mb-3"
                />

                <Button color="dark" style={{ marginBottom: "2rem" }} block>
                  Login
                </Button>
              </FormGroup>
            </Form>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isAutheticated: state.auth.isAutheticated,
  error: state.error
});

export default connect(mapStateToProps, { login, clearErrors })(LoginModal);
//mapStateToProps gets state variables from elsewhere in the app.
//the stuff in the curly braces are methods brought in to modify state in other parts of the app
//all these things will be declared in the component props
