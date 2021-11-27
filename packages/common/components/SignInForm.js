import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@material-ui/core';
import { NavLink } from 'react-router-dom';
import StructLogo from '../assets/images/new_logo.png';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import LoadingModal from '@monostruct/common/components/LoadingModal';

const useStyles = makeStyles((theme) => ({
  container: {
    background: '#E8E9EA',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  card_container: {
    maxWidth: '800px',
    width: '45%',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  logo_container: {
    display: 'flex',
    justifyContent: 'center'
  },
  logo: {
    height: 40
  },
  form_root: {
    display: 'flex',
    flexDirection: 'column',
    '& .MuiTextField-root': {
      margin: theme.spacing(1)
    }
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff'
  }
}));

const SignInForm = ({ handleLoginSubmit, msg, isLoginStarted }) => {
  const classes = useStyles();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    handleLoginSubmit({ email, password });
  };

  return (
    <Box as="div" className={classes.container}>
      <Card elevation={3} className={classes.card_container}>
        <CardContent style={{ width: '100%' }}>
          <Box as="div" className={classes.logo_container}>
            <img src={StructLogo} className={classes.logo} />
          </Box>
          <form
            className={classes.form_root}
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            <TextField
              id="outlined-basic"
              variant="outlined"
              label="Email"
              type="email"
              name="email" //has to match the name of the variable in the state
              onChange={(event) => setEmail(event.target.value)}
            />
            <TextField
              id="outlined-password"
              variant="outlined"
              label="Password"
              type="password"
              name="password" //has to match the name of the variable in the state
              onChange={(event) => setPassword(event.target.value)}
            />

            <Box as="div" style={{ margin: '8px' }}>
              <Button
                type="submit"
                variant="contained"
                style={{
                  marginBottom: '2rem',
                  width: '100%',
                  background: '#2b2b2b'
                }}
                color="primary"
              >
                Login
              </Button>
            </Box>
          </form>
          <LoadingModal isLoading={isLoginStarted} />
          <NavLink to="/register"> Go to Registration Page </NavLink>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SignInForm;
