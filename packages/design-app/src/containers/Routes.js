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
        <Switch>
          <Route exact path='/design' component={ProductDesign}></Route>
          <Route exact path='/product' component={Product}></Route>
          <Route exact path='/appdesigner' component={AppDesigner}></Route>
        </Switch>
      </Layout>
    </Router>
  )
}
