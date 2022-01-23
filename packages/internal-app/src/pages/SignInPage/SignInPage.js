import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import SignInForm from '@monostruct/common/components/SignInForm';
import LoadingModal from '@monostruct/common/components/LoadingModal';

import { AuthContext } from '@monostruct/common/context/AuthContext';
import AuthService from '@monostruct/common/services/AuthServices';
import { useQuery } from '@monostruct/common/utils/customHooks';

const SignInPage = () => {
  const query = useQuery();
  const { authUser, setAuthUser } = React.useContext(AuthContext);
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const resUser = await AuthService.fetchUser();
      setAuthUser({ user: resUser });

      setIsLoading(false);
    } catch (error) {
      localStorage.removeItem('token');
      console.log('Error', error);
    }
  };

  useEffect(() => {
    if (authUser.user) {
      if (query.get('redirect-url')) {
        window.location = query.get('redirect-url');
      } else {
        history.push('/items');
      }
    }
  }, [authUser]);

  useEffect(() => {
    if (localStorage.getItem('token', null)) {
      fetchUser();
    }
  }, []);

  const handleLoginSubmit = async (data) => {
    try {
      const user = await AuthService.signIn(data);
      setAuthUser({ user: user });
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
