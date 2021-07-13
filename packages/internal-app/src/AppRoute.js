import React, { useEffect } from 'react';
import { Route, Redirect, useHistory } from 'react-router-dom';
// import { isLoggedIn } from './utils/usefulHelpers';
import { useSelector } from 'react-redux';

const AppRoute = ({ component: Component, authenticate, ...rest }) => {
    const history = useHistory();
    const { isAuthenticated, user } = useSelector(state => state.auth);

    const isLoggedIn = () => localStorage.getItem('token') !== 'null';


    return (
        <Route
            {...rest}
            render={({ location, ...other }) => {
                if (authenticate && isLoggedIn) {
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
