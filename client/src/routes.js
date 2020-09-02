import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import { Spinner } from "reactstrap";

import Login from '../src/page/Login'
import Vendors from "./components/mainNav/Vendors";
import { useSelector } from 'react-redux';
import Layout from './components/Layout';

export default function AppRoutes() {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  return (
    <Router>
      <div>
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route exact path="/">
            <Login />
          </Route>
<<<<<<< HEAD
          <Layout>
            <Switch>
              <Route path='/vendors'>
                <Vendors />
              </Route>
            </Switch>
          </Layout>
=======
          <Switch>
            <AppNavbar/>
            <Route path='/vendors'>
              <Vendors />
            </Route>
          </Switch>
>>>>>>> 00f41aafaf2213b91035081ae51c9069be3fb64b
        </Switch>
      </div>
    </Router>
  );
}

const PrivateRoute = ({ component: Component, ...rest }) => {
  return <Route
    {...rest}
    render={props =>
      props.auth && props.auth.isAuthenticated ? (
        <div>
          {props.auth.user != null && props.auth.user.userAccess != null ? (
            <div>
<<<<<<< HEAD
              {/* <AppNavbar /> */}
=======
              <AppNavbar />
>>>>>>> 00f41aafaf2213b91035081ae51c9069be3fb64b
              <Component {...props} />
            </div>
          ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center"
                }}
              >
                <Spinner animation="border" />
              </div>
            )}
        </div>
      )
        : <Redirect
          to={{
            pathname: '/'
          }}
        />}
  ></Route>
}