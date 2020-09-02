import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import { useSelector } from 'react-redux';
import { Spinner } from "reactstrap";
import Layout from './components/Layout';
import Login from './page/Login'
import Vendors from "./page/Vendors";
import Dashboard from './page/Dashboard';
import ProcessGroups from './page/ProcessGroups';
import Clients from './page/Clients';
import ProductDesign from './page/ProductDesign';
import Items from './page/Items'


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
          <Layout>
            <Switch>
              <Route path='/dashboard' component={Dashboard} />
              <Route path='/product-design' component={ProductDesign} />
              <Route path='/clients' component={Clients} />
              <Route path='/vendors' component={Vendors} />
              <Route path='/process-groups' component={ProcessGroups} />
              <Route path='/items' component={Items} />
            </Switch>
          </Layout>
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
              {/* <AppNavbar /> */}
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