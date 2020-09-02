import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import { Spinner } from "reactstrap";
import AppNavbar from '../src/components/AppNavbar';
import Login from '../src/page/Login'
import Vendors from "./components/mainNav/Vendors";
import { useSelector } from 'react-redux';

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
          <Switch>
            <AppNavbar/>
            <Route path='/vendors'>
              <Vendors />
            </Route>
          </Switch>
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
              <AppNavbar />
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