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
import Login from './page/Login';
import Register from './page/RegisterPage';
import Vendors from "./page/Vendors";
import Dashboard from './page/Dashboard';
import ProcessGroups from './page/ProcessGroups';
import Clients from './page/Clients';
import ProductDesign from './page/ProductDesign';
import Items from './page/Items';
import AccessSetup from './page/AccessSetup';
import ConfigurationHistory from './page/ConfigurationHistory';
import AccessConfiguration from './page/AccessConfiguration';
import ViewAccess from './page/ViewAccess';

import ClientDetail from "./page/ClientDetail";
// import ProcessGroupDetail from "./subNav/ProcessGroupDetail";
// import VendorDetail from "./subNav/VendorDetail";
import ItemDetail from "./page/ItemDetail";
// import ProductDesignDetail from "./subNav/ProductDesignDetail";

export default function AppRoutes() {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  return (
    <Router>
      <div>
        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route exact path="/" component={Login} />
          {/* <Route path="/register" component={Register} /> */}
          <Layout>
            <Switch>
              <Route path='/dashboard' component={Dashboard} />
              <Route path='/product-design' component={ProductDesign} />
              <Route exact path='/clients' component={Clients} />
              <Route path='/clients/:id' component={ClientDetail} />
              <Route path='/vendors' component={Vendors} />
              <Route path='/process-groups' component={ProcessGroups} />
              <Route exact path='/items' component={Items} />
              <Route path='/items/:id' component={ItemDetail} />
              <Route path='/access-setup' component={AccessSetup} />
              <Route path='/configuration-history' component={ConfigurationHistory} />
              <Route path='/access-configuration' component={AccessConfiguration} />
              <Route path='/view-access' component={ViewAccess} />
            </Switch>
          </Layout>
          <Route path="*" component={NoMatch} />
        </Switch>
      </div>
    </Router>
  );
}

const ProtectedRoute = ({ component: Comp, loggedIn, path, ...rest }) => {
  return (
    <Route
      path={path}
      {...rest}
      render={(props) => {
        return loggedIn ? (
          <Comp {...props} />
        ) : (
            <Redirect
              to={{
                pathname: "/",
                state: {
                  prevLocation: path,
                  error: "You need to login first!",
                },
              }}
            />
          );
      }}
    />
  );
};

export function NoMatch({ location }) {
  return (
    <>
      <div className="mt-5">
        <div sm={{ span: 8, offset: 2 }}>
          <h1>Page Not Found</h1>
        </div>
      </div>
    </>
  );
}