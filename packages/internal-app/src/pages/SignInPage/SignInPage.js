import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../actions/authActions';
import { useHistory } from 'react-router-dom';
import SignInForm from '@monostruct/common/components/SignInForm';

const SignInPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { isAuthenticated, isLoginStarted } = useSelector(
    (state) => state.auth
  );
  const error = useSelector((state) => state.error);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (error && error.id === 'LOGIN_FAIL') {
      setMsg(error.msg.msg);
    } else {
      setMsg(null);
    }
  }, [error]);

  useEffect(() => {
    if (isAuthenticated) {
      history.push('/clients');
    }
  }, [isAuthenticated]);

  const handleLoginSubmit = (data) => dispatch(login(data));

  return (
    <SignInForm
      handleLoginSubmit={handleLoginSubmit}
      msg={msg}
      isLoginStarted={isLoginStarted}
    />
  );
};

export default SignInPage;
