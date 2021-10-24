import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";

import { Spinner } from "reactstrap";
import { useSelector } from 'react-redux';
import Layout from './components/Layout';
import Login from './pages/SignInPage/SignInPage';
import Register from './pages/RegisterPage';

import VendorListPage from "./pages/VendorListPage";
import VendorDetailPage from "./pages/VendorDetailPage";

import Dashboard from './pages/Dashboard';
import ProcessGroups from './containers/processGroups/ProcessGroups';
import ItemListPage from './pages/ItemListPage';
import AccessSetup from './pages/AccessSetup';
import ConfigurationHistory from './pages/ConfigurationHistory';
import AccessConfiguration from './pages/AccessConfiguration';
import ViewAccess from './pages/ViewAccess';
import ClientListPage from './pages/ClientListPage';
import ClientDetailPage from "./pages/ClientDetailPage";

import FactoryListPage from './pages/FactoryListPage';
import FactoryDetail from './pages/FactoryDetailPage'

import ItemDetail from "./containers/itemDetail";
import Administrative from './containers/administrative';
import ViewMyProfile from './containers/viewMyProfile'


// import Viewer from './DynamicHierarchy'

export default function AppRoutes() {
  const isUserLoading = useSelector(state => state.auth.isLoading);

  if (isUserLoading) {
    return <Spinner
      className='UserLoading__Progress'
      animation="border" />
  }
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Login} />
        <Route path="/register" component={Register} />
        {/* <Route path="/viewer" component={Viewer} /> */}
        <Layout>

          <div style={{ marginLeft: '7%', marginRight: '7%' }}>
            <Switch>
              <AppRoute authenticate path='/dashboard' component={Dashboard} />
              <AppRoute authenticate exact path='/vendors' component={VendorListPage} />
              <AppRoute authenticate exact path='/clients' component={ClientListPage} />
              <AppRoute authenticate exact path='/process-groups' component={ProcessGroups} />
              <AppRoute authenticate exact path='/items' component={ItemListPage} />
              <AppRoute authenticate exact path='/factories' component={FactoryListPage} />
              <AppRoute authenticate path='/access-setup' component={AccessSetup} />
              <AppRoute authenticate path='/view-access' component={ViewAccess} />

              <AppRoute authenticate path='/configuration-history' component={ConfigurationHistory} />
            </Switch>
          </div>
          <Switch>

            <AppRoute authenticate path='/clients/:id' component={ClientDetailPage} />

            <AppRoute authenticate path='/vendors/:id' component={VendorDetailPage} />

            <AppRoute authenticate path='/items/:id' component={ItemDetail} />

            <AppRoute authenticate path='/factories/:id' component={FactoryDetail} />

            <AppRoute authenticate path='/access-configuration/:id' component={AccessConfiguration} />

            <AppRoute authenticate path="/administrative" component={Administrative} />


            <AppRoute authenticate path='/viewMyProfile' component={ViewMyProfile} />
          </Switch>
        </Layout>
      </Switch>
    </Router>
  );
}


const AppRoute = ({ component: Component, authenticate, ...rest }) => {

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
