import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useQuery } from '@monostruct/common/utils/customHooks';
import SignInForm from '@monostruct/common/components/SignInForm';
import LoadingModal from '@monostruct/common/components/LoadingModal';

import { AuthContext } from '@monostruct/common/context/AuthContext';
import AuthService from '@monostruct/common/services/AuthServices';

const SignInPage = () => {
  const { authUser, setAuthUser } = React.useContext(AuthContext);
  const history = useHistory();
  const query = useQuery();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authUser.isAuthenticated) {
      history.push('/design');
    }
  }, [authUser, history]);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const resUser = await AuthService.fetchUser();
      setAuthUser({ user: resUser, isAuthenticated: true });

      setTimeout(() => {
        setIsLoading(false);
        history.push('/design');
      }, 3000);
    } catch (error) {
      console.log('Error', error);
    }
  };

  useEffect(() => {
    if (query.get('token')) {
      localStorage.setItem('token', query.get('token'));
      fetchUser();
    } else if (localStorage.getItem('token', null)) {
      // fetchUser();
    }
  }, [query.get('token')]);

  const handleLoginSubmit = async (data) => {
    try {
      const user = await AuthService.signIn(data);
      setAuthUser({ user, isAuthenticated: true });
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
