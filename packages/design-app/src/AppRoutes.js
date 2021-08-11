import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';

import AppDesignerPage from './pages/AppDesignerPage';
import Layout from './components/Layout';
import DesignPage from './pages/DesignPage';
import Product from './containers/product'
import HomePage from './pages/HomePage';

export default function Routes() {
  return (
    <Router>
      <Layout>
        <div style={{ marginLeft: '7%', marginRight: '7%' }}>
          <Switch>
            <Route path='/' component={HomePage} />
            <Route path='/design' component={DesignPage} />
            <Route path='/product' component={Product} />
            <Route path='/appdesigner' component={AppDesignerPage} />
          </Switch>

        </div>
      </Layout>
    </Router>
  )
}
