import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

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

export default function Routes() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={SignInPage} />
        <div style={{ marginLeft: '7%', marginRight: '7%' }}>
          <Layout>
            <Switch>
              <Route path="/design" component={DesignPage} />
              <Route path="/product" component={ProductMaker} />
              <Route path="/cad" component={CadMaker} />
              <Route path="/pcb" component={PcbTab} />
              <Route path="/silicon" component={SiliconMaker} />
              <Route path="/clothes" component={ClothesMaker} />
              <Route path="/architecture" component={ArchitectureDesigner} />
              <Route path="/predesigned" component={PredesignedComponents} />
              <Route path="/appdesigner" component={AppDesignerPage} />

              <Route path="/omnidesign" component={OmniDesign} />
              <Route path="/my_profile" component={MyProfile} />
            </Switch>
          </Layout>
        </div>
      </Switch>
    </Router>
  );
}
