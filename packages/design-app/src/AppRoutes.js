import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';

import AppDesignerPage from './pages/AppDesignerPage';
import Layout from './components/Layout';
import DesignPage from './pages/DesignPage/index';
import Product from './containers/product'
import CadTab from './containers/cad'
import PcbTab from './containers/pcb'
import Silicon from './containers/silicon'
import Clothes from './containers/clothes'
import Architecture from './containers/architecture'
import PredesignedComponents from './containers/predesigned'
import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';

export default function Routes() {
  return (
    <Router>
      <Switch>
        <Route exact path='/' component={SignInPage} />
        <div style={{ marginLeft: '7%', marginRight: '7%' }}>
          <Layout>
            <Switch>
              <Route path='/design' component={DesignPage} />
              <Route path='/product' component={Product} />
              <Route path='/cad' component={CadTab} />
              <Route path='/pcb' component={PcbTab} />
              <Route path='/silicon' component={Silicon} />
              <Route path='/clothes' component={Clothes} />
              <Route path='/architecture' component={Architecture} />
              <Route path='/predesigned' component={PredesignedComponents} />
              <Route path='/appdesigner' component={AppDesignerPage} />
            </Switch>
          </Layout>
        </div>
      </Switch>

    </Router>
  )
}
