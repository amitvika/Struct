import React, { useState, useEffect } from 'react';
import { register } from '../actions/authActions';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Card, CardContent } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

const Register = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [msg, setMsg] = useState(null);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const error = useSelector((state) => state.error);

  useEffect(() => {
    if (error.id === 'REGISTER_FAIL') {
      setMsg(error.msg.msg);
    }

    if (isAuthenticated) {
      history.push('/');
    }
  }, [error, isAuthenticated, history]);

  const onSubmit = (e) => {
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
      <Card style={{ marginLeft: '22%', width: '56%' }}>
        <h2>Register</h2>
        <CardContent>
          {msg ? <Alert severity="info">{msg}</Alert> : null}
          <form onSubmit={onSubmit}>
            <FormControl>
              <InputLabel for="name">Name</InputLabel>
              <Input
                type="text"
                name="name" //has to match the name of the variable in the state
                id="name"
                placeholder="Name"
                onChange={(event) => setName(event.target.value)}
                className="mb-3"
              />
            </FormControl>
            <FormControl>
              <InputLabel for="email">Email</InputLabel>
              <Input
                type="email"
                name="email" //has to match the name of the variable in the state
                id="email"
                placeholder="Email"
                onChange={(event) => setEmail(event.target.value)}
                className="mb-3"
              />
            </FormControl>
            <FormControl>
              <InputLabel for="password">Password</InputLabel>
              <Input
                type="password"
                name="password" //has to match the name of the variable in the state
                id="password"
                placeholder="Password"
                onChange={(event) => setPassword(event.target.value)}
                className="mb-3"
              />
            </FormControl>
            <FormControl>
              <InputLabel for="password2">Re-type Password</InputLabel>
              <Input
                type="password"
                name="password2" //has to match the name of the variable in the state
                id="password2"
                placeholder="Password"
                onChange={(event) => setPassword2(event.target.value)}
                className="mb-3"
              />
            </FormControl>

            <Button style={{ marginBottom: '2rem' }} block>
              Register
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
