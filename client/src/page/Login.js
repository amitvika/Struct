import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
  Spinner
} from "reactstrap";
import { useDispatch, useSelector } from 'react-redux';
import { login } from "../actions/authActions";
import { useHistory } from "react-router-dom";
import { Card, CardContent } from "@material-ui/core";
import { NavLink } from 'react-router-dom';
import StructLogo from '../assets/images/logo_black.png';

const LoginModal = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(null);
  const { isAuthenticated, isLoginStarted } = useSelector(state => state.auth);
  const error = useSelector(state => state.error);

  useEffect(() => {
    if (error && error.id === "LOGIN_FAIL") {
      setMsg(error.msg.msg);
    }
    else {
      setMsg(null);
    }
  }, [error]);

  useEffect(() => {
    if (isAuthenticated) {
      history.push('/dashboard');
    }
  }, [isAuthenticated]);

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    dispatch(login({ email, password }))
  }

  return (
    <div>
      <Card style={{ marginLeft: "22%", width: "56%" }}>
        <CardContent>
          <div
            style={{
              display: "flex",
              justifyContent: "center"
            }}
          >

            <img
              src={StructLogo}
              width="250"
              height="35"
              className="d-inline-block align-top"
            />

            {/* <h3>Struct</h3> */}
          </div>
          {msg ? (
            <Alert color="danger">{msg}</Alert>
          ) : null}
          <Form onSubmit={handleLoginSubmit}>
            <FormGroup>
              <Label for="email">Email</Label>
              <Input
                type="email"
                name="email" //has to match the name of the variable in the state
                id="email"
                placeholder="Email"
                onChange={(event) => setEmail(event.target.value)}
                className="mb-3"
              />
              <Label for="password">Password</Label>
              <Input
                type="password"
                name="password" //has to match the name of the variable in the state
                id="password"
                placeholder="Password"
                onChange={(event) => setPassword(event.target.value)}
                className="mb-3"
              />

              <Button color="dark" style={{ marginBottom: "2rem" }} block>
                Login
              </Button>

            </FormGroup>
          </Form>
          {isLoginStarted && <Spinner color="primary" />}
          <NavLink to='/register'> Go to Registration Page </NavLink>
        </CardContent>
      </Card>
    </div>
  );
}


export default LoginModal;
//mapStateToProps gets state variables from elsewhere in the app.
//the stuff in the curly braces are methods brought in to modify state in other parts of the app
//all these things will be declared in the component props
