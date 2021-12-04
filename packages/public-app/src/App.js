import React, { Fragment } from 'react';
import { BrowserRouter, Switch, Route as DefaultRoute } from 'react-router-dom';
import Routes from './Routes';
import NavigationBar from './components/NavigationBar/NavigationBar';
import HomePageLayout from './components/Layout';
import Home from './containers/home/index';
import Login from './containers/login/index';

const DefaultLayout = ({ children, title }) => (
  <Fragment>
    <NavigationBar title={title} />
    {children}
  </Fragment>
);

const LoginPageLayout = ({ children }) => <Fragment>{children}</Fragment>;

const Route = ({ component: Component, layout: Layout, title, ...rest }) => {
  return (
    <DefaultRoute
      {...rest}
      render={(props) => (
        <Layout title={title}>
          <Component {...props} />
        </Layout>
      )}
    />
  );
};

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Switch>
          <Route exact path={'/'} component={Home} layout={HomePageLayout} />
          <Route
            exact
            path={'/login'}
            component={Login}
            layout={LoginPageLayout}
          />

          {Routes.map((route) => (
            <Route
              exact
              path={route.path}
              key={route.path}
              title={route.sidebarName}
              component={route.component}
              layout={DefaultLayout}
            ></Route>
          ))}
        </Switch>
      </BrowserRouter>
    </div>
  );
};

export default App;
