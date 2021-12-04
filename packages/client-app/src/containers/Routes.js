import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';

import HomePage from '../pages/homePage/index';
import MyPurchases from 'src/pages/myPurchases';
import Layout from 'src/components/Layout';

export default function AppRoutes() {
  return (
    <Router>
      <Layout>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/my-purchases" component={MyPurchases} />
        </Switch>
      </Layout>
    </Router>
  );
}
