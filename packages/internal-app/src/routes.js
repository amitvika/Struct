import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import { Spinner } from "reactstrap";
import { useSelector } from 'react-redux';
import AppRoute from './AppRoute';
import Layout from './components/Layout';
import Login from './pages/LoginPage';
import Register from './pages/RegisterPage';

import Vendors from "./containers/vendor/Vendors";
import VendorDetail from "./containers/vendor/VendorDetail";

import Dashboard from './pages/Dashboard';
import ProcessGroups from './containers/processGroups/ProcessGroups';
import Items from './containers/item/Items';
import AccessSetup from './pages/AccessSetup';
import ConfigurationHistory from './pages/ConfigurationHistory';
import AccessConfiguration from './pages/AccessConfiguration';
import ViewAccess from './pages/ViewAccess';
import ClientListPage from './pages/ClientListPage';
import ClientDetailPage from "./pages/ClientDetailPage";

import Factories from './containers/factories';
import FactoryDetail from './containers/factories/FactoryDetail'

// import ProductDesign from './containers/productDesign';
import ItemDetail from "./containers/itemDetail";
import Administrative from './containers/administrative';
import ViewMyProfile from './containers/viewMyProfile'


// import Viewer from './page/3DViewer';
import Viewer from './gltf/DropZone'
//import Sample from "./page/sample";

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
        <Route path="/viewer" component={Viewer} />
        {/* <Route path="/sample" component={Sample} /> */}
        <Layout>

          <div style={{ marginLeft: '7%', marginRight: '7%' }}>
            <Switch>
              {/* <AppRoute authenticate exact path='/design' component={ProductDesign} /> */}
              <AppRoute authenticate path='/dashboard' component={Dashboard} />
              <AppRoute authenticate exact path='/vendors' component={Vendors} />
              <AppRoute authenticate exact path='/clients' component={ClientListPage} />
              <AppRoute authenticate exact path='/process-groups' component={ProcessGroups} />
              <AppRoute authenticate exact path='/items' component={Items} />
              <AppRoute authenticate exact path='/factories' component={Factories} />
              <AppRoute authenticate path='/access-setup' component={AccessSetup} />
              <AppRoute authenticate path='/view-access' component={ViewAccess} />

              <AppRoute authenticate path='/configuration-history' component={ConfigurationHistory} />
            </Switch>
          </div>
          <Switch>

            <AppRoute authenticate path='/clients/:id' component={ClientDetailPage} />

            <AppRoute authenticate path='/vendors/:id' component={VendorDetail} />

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