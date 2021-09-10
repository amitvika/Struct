import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useQuery } from '@ravibasil/common/utils/customHooks';
import SignInForm from '@ravibasil/common/components/SignInForm';
import LoadingModal from '@ravibasil/common/components/LoadingModal';

import { AuthContext } from '../../context/AuthContext';
import AuthService from '../../services/AuthServices';
import { loadUserApi } from '@ravibasil/common/api/auth';

const SignInPage = () => {
  const { authUser, setAuthUser } = React.useContext(AuthContext);
  const history = useHistory();
  const query = useQuery();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authUser.user) {
      history.push('/design');
    }
  }, [authUser.user]);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const resUser = await AuthService.fetchUser();
      setAuthUser({ user: resUser, isAuthenticated: true });
      console.log(resUser)

      // setTimeout(() => {
      //   setIsLoading(false);
      //   history.push('/design');
      // }, 3000);

    } catch (error) {
      console.log('Error', error);
    }
  };

  useEffect(() => {
    if (query.get('token')) {
      localStorage.setItem('token', query.get('token'));
      fetchUser();
    }
  }, [query.get('token')]);
  
  const handleLoginSubmit = async (data) => {
    try {
      const user = await AuthService.signIn(data);
      setAuthUser({ user });
    } catch (error) {}
  };

  return (
    <>
      <LoadingModal isLoading={isLoading} />
      <SignInForm handleLoginSubmit={handleLoginSubmit} />
    </>
  );
};

export default SignInPage;
