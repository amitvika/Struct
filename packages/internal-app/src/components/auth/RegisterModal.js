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
import { register } from "../../actions/authActions";
import { clearErrors } from "../../actions/errorActions";

class RegisterModal extends Component {
  state = {
    modal: false,
    name: "",
    email: "",
    password: "",
    password2: "",
    msg: null
  };
  static propTypes = {
    isAutheticated: PropTypes.bool,
    error: PropTypes.object.isRequired,
    register: PropTypes.func.isRequired,
    clearErrors: PropTypes.func.isRequired
  };
  componentDidUpdate(prevProps) {
    const { error, isAutheticated } = this.props;
    if (error !== prevProps.error) {
      //check for register error
      if (error.id === "REGISTER_FAIL") {
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
    const { name, email, password, password2 } = this.state;
    //Create user object
    const newUser = {
      name,
      email,
      password,
      password2
    };
    //Attempt to register
    this.props.register(newUser);
  };
  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    return (
      <div>
        <DropdownItem style={{ color: "black" }} onClick={this.toggle} href="#">
          Register
        </DropdownItem>
        <Modal isOpen={this.state.modal} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>Register</ModalHeader>
          <ModalBody>
            {this.state.msg ? (
              <Alert color="danger">{this.state.msg}</Alert>
            ) : null}
            <Form onSubmit={this.onSubmit}>
              <FormGroup>
                <Label for="name">Name</Label>
                <Input
                  type="text"
                  name="name" //has to match the name of the variable in the state
                  id="name"
                  placeholder="Name"
                  onChange={this.onChange}
                  className="mb-3"
                />
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
                <Label for="password2">Re-type Password</Label>
                <Input
                  type="password"
                  name="password2" //has to match the name of the variable in the state
                  id="password2"
                  placeholder="Password"
                  onChange={this.onChange}
                  className="mb-3"
                />
                <Button color="dark" style={{ marginBottom: "2rem" }} block>
                  Register
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

export default connect(mapStateToProps, { register, clearErrors })(
  RegisterModal
);
