import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { useQuery } from '@ravibasil/common/utils/customHooks'
import SignInForm from '@ravibasil/common/components/SignInForm';
import LoadingModal from '@ravibasil/common/components/LoadingModal';

import { AuthContext } from "../../context/AuthContext";
import AuthService from '../../services/AuthServices';

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

  useEffect(() => {
    if (query.get('token')) {

      setIsLoading(true);
      localStorage.setItem('token', query.get('token'));

      setTimeout(() => {
        setIsLoading(false)
        history.push('/design');
      }, 3000)
    }

  }, [query.get('token')])


  const handleLoginSubmit = async (data) => {
    try {
      const user = await AuthService.signIn(data);
      setAuthUser({ user });
    }
    catch (error) {

    }
  }

  return (
    <>
      <LoadingModal isLoading={isLoading} />
      <SignInForm handleLoginSubmit={handleLoginSubmit} />
    </>
  );
}


export default SignInPage;