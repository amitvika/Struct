import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';

import AppDesignerPage from './pages/AppDesignerPage';
import Layout from './components/Layout';
import DesignPage from './pages/DesignPage/index';
import CadMaker from './pages/CadMaker/CadMaker';
import PcbTab from './containers/pcb';
import PredesignedComponents from './containers/predesigned';
import SignInPage from './pages/SignInPage';
import OmniDesign from './pages/Omnidesign';
import MyProfile from './pages/myProfile';
import ProductMaker from './pages/ProductMaker/ProductMaker';
import SiliconMaker from './pages/SiliconMaker/SiliconMaker';
import ClothesMaker from './pages/ClothesMaker/ClothesMaker';
import ArchitectureDesigner from './pages/ArchitectureDesigner/ArchitectureDesigner';
import { AuthContext } from '@monostruct/common/context/AuthContext';

export default function Routes() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={SignInPage} />
        <div style={{ marginLeft: '7%', marginRight: '7%' }}>
          <Layout>
            <Switch>
              <AppRoute authenticate path="/design" component={DesignPage} />
              <AppRoute authenticate path="/product" component={ProductMaker} />
              <AppRoute authenticate path="/cad" component={CadMaker} />
              <AppRoute authenticate path="/pcb" component={PcbTab} />
              <AppRoute authenticate path="/silicon" component={SiliconMaker} />
              <AppRoute authenticate path="/clothes" component={ClothesMaker} />
              <AppRoute
                authenticate
                path="/architecture"
                component={ArchitectureDesigner}
              />
              <AppRoute
                authenticate
                path="/predesigned"
                component={PredesignedComponents}
              />
              <AppRoute
                authenticate
                path="/appdesigner"
                component={AppDesignerPage}
              />

              <AppRoute
                authenticate
                path="/omnidesign"
                component={OmniDesign}
              />
              <AppRoute authenticate path="/my_profile" component={MyProfile} />
            </Switch>
          </Layout>
        </div>
      </Switch>
    </Router>
  );
}

const AppRoute = ({ component: Component, authenticate, ...rest }) => {
  const { authUser } = React.useContext(AuthContext);
  // const isLoggedIn = () => localStorage.getItem('token') !== 'null';

  return (
    <Route
      {...rest}
      render={({ location, ...other }) => {
        if (authenticate && authUser.isAuthenticated) {
          return <Component location={location} {...other} />;
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
