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
import Login from './containers/Login';
import Register from './page/RegisterPage';

import Vendors from "./containers/vendor/Vendors";
import VendorDetail from "./containers/vendor/VendorDetail";

import Dashboard from './page/Dashboard';
import ProcessGroups from './containers/processGroups/ProcessGroups';
import Items from './containers/item/Items';
import AccessSetup from './page/AccessSetup';
import ConfigurationHistory from './page/ConfigurationHistory';
import AccessConfiguration from './page/AccessConfiguration';
import ViewAccess from './page/ViewAccess';
import Clients from './containers/client';
import ClientDetail from "./containers/client/ClientDetail";

import Factories from './containers/factories';
import FactoryDetail from './containers/factories/FactoryDetail'

import ProductDesign from './containers/productDesign';
import ItemDetail from "./containers/itemDetail";
import UserSetup from './containers/userSetup';
import ViewMyProfile from './containers/viewMyProfile'


// import Viewer from './page/3DViewer';
import Viewer from './gltf/DropZone'
import CriteriaUpload from "./containers/criteriaUpload";

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
                <Layout>

                    <div style={{ marginLeft: '7%', marginRight: '7%' }}>
                        <Switch>
                            <AppRoute authenticate exact path='/design' component={ProductDesign} />
                            <AppRoute authenticate path='/dashboard' component={Dashboard} />
                            <AppRoute authenticate exact path='/vendors' component={Vendors} />
                            <AppRoute authenticate exact path='/clients' component={Clients} />
                            <AppRoute authenticate exact path='/process-groups' component={ProcessGroups} />
                            <AppRoute authenticate exact path='/items' component={Items} />
                            <AppRoute authenticate exact path='/factories' component={Factories} />
                            <AppRoute authenticate path='/access-setup' component={AccessSetup} />
                            <AppRoute authenticate path='/view-access' component={ViewAccess} />

                            <AppRoute authenticate path='/configuration-history' component={ConfigurationHistory} />
                        </Switch>
                    </div>
                    <Switch>
                        {/* <AppRoute authenticate path='/design/:id' component={ProductDesignDetail} /> */}

                        <AppRoute authenticate path='/clients/:id' component={ClientDetail} />

                        <AppRoute authenticate path='/vendors/:id' component={VendorDetail} />

                        {/* <AppRoute authenticate path='/process-groups/:id' component={ProcessGroupDetail} /> */}

                        <AppRoute authenticate path='/items/:id' component={ItemDetail} />

                        <AppRoute authenticate path='/factories/:id' component={FactoryDetail} />

                        <AppRoute authenticate path='/access-configuration/:id' component={AccessConfiguration} />

                        <AppRoute authenticate path="/user-setup" component={UserSetup} />
                        <AppRoute authenticate path="/criteria-upload" component={CriteriaUpload} />


                        <AppRoute authenticate path='/viewMyProfile' component={ViewMyProfile} />
                    </Switch>
                </Layout>
            </Switch>
        </Router>
    );
}