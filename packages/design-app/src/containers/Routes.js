import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';

import AppDesigner from './appDesigner';
import Layout from '../components/Layout';
import ProductDesign from './design';
import Product from './product'

export default function Routes() {
  return (
    <Router>
      <Layout>
        <div style={{ marginLeft: '7%', marginRight: '7%' }}>
          <Switch>
            <Route path='/design' component={ProductDesign}></Route>
            <Route path='/product' component={Product}></Route>
            <Route path='/appdesigner' component={AppDesigner}></Route>
          </Switch>
        
        </div>
      </Layout>
    </Router>
  )
}
