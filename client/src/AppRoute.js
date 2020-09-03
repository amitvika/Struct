import React, { useEffect } from 'react';
import { Route, Redirect, useHistory } from 'react-router-dom';
import { isLoggedIn } from './utils/usefulHelpers';

const AppRoute = ({ component: Component, authenticate, ...rest }) => {
  const history = useHistory();

  useEffect(_ => {
    if (authenticate && !isLoggedIn()) {
      history.push('/login');
    }
  },
    [authenticate],
  );

  return (
    <Route
      {...rest}
      render={({ location, ...other }) => {
        if (!authenticate || isLoggedIn()) {
          return <Component location={location} {...other} />
        }
        return (
          <Redirect
            to={{
              pathname: '/'
            }}
          />
        );
      }}
    />
  );
};

export default AppRoute;
