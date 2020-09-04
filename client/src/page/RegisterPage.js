import React, { useState, useEffect } from "react";
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
} from "reactstrap";
import { register } from "../actions/authActions";
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from "react-router-dom";
import { Card, CardContent } from "@material-ui/core";

const Register = () => {

  const dispatch = useDispatch();
  const history = useHistory();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [msg, setMsg] = useState(null);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const error = useSelector(state => state.error);

  useEffect(() => {
    if (error.id === "REGISTER_FAIL") {
      setMsg(error.msg.msg);
    }

    if (isAuthenticated) {
      history.push('/');
    }
  }, [error, isAuthenticated]);

  const onSubmit = e => {
    e.preventDefault();
    //Create user object
    const newUser = {
      name,
      email,
      password,
      password2
    };
    //Attempt to register
    dispatch(register(newUser));
  };
  return (
    <div>
      <Card style={{ marginLeft: "22%", width: "56%" }}>
        <h2>Register</h2>
        <CardContent>
          {msg ?
            <Alert color="danger">{msg}</Alert>
            : null}
          <Form onSubmit={onSubmit}>
            <FormGroup>
              <Label for="name">Name</Label>
              <Input
                type="text"
                name="name" //has to match the name of the variable in the state
                id="name"
                placeholder="Name"
                onChange={(event) => setName(event.target.value)}
                className="mb-3"
              />
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
              <Label for="password2">Re-type Password</Label>
              <Input
                type="password"
                name="password2" //has to match the name of the variable in the state
                id="password2"
                placeholder="Password"
                onChange={(event) => setPassword2(event.target.value)}
                className="mb-3"
              />
              <Button color="dark" style={{ marginBottom: "2rem" }} block>
                Register
                </Button>
            </FormGroup>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Register;
