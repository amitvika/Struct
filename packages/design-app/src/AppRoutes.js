import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';

import AppDesignerPage from './pages/AppDesignerPage';
import Layout from './components/Layout/Layout';
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
import CadItemDetailPage from './pages/CadItemDetailPage/CadItemDetailPage';

export default function Routes() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={SignInPage} />
        <Layout>
          <Switch>
            <Route exact authenticate path="/design" component={DesignPage} />
            <Route
              exact
              authenticate
              path="/product"
              component={ProductMaker}
            />
            <Route exact authenticate path="/cad" component={CadMaker} />
            <Route
              exact
              authenticate
              path="/cad/:id"
              component={CadItemDetailPage}
            />

            <Route exact authenticate path="/pcb" component={PcbTab} />
            <Route
              exact
              authenticate
              path="/silicon"
              component={SiliconMaker}
            />
            <Route
              exact
              authenticate
              path="/clothes"
              component={ClothesMaker}
            />
            <Route
              authenticate
              path="/architecture"
              component={ArchitectureDesigner}
            />
            <Route
              authenticate
              path="/predesigned"
              component={PredesignedComponents}
            />
            <Route
              authenticate
              path="/appdesigner"
              component={AppDesignerPage}
            />

            <Route authenticate path="/omnidesign" component={OmniDesign} />
            <Route authenticate path="/my_profile" component={MyProfile} />
          </Switch>
        </Layout>
      </Switch>
    </Router>
  );
}

// const AppRoute = ({ component: Component, authenticate, ...rest }) => {
//   const { authUser } = React.useContext(AuthContext);

//   return (
//     <Route
//       {...rest}
//       render={({ location, ...other }) => {
//         if (authenticate && authUser.isAuthenticated) {
//           return <Component location={location} {...other} />;
//         }
//         return (
//           <Redirect
//             to={{
//               pathname: '/'
//             }}
//           />
//         );
//       }}
//     />
//   );
// };

// const AppRoute = ({ component: Component, authenticate, ...rest }) => {
//   const isLoggedIn = () => localStorage.getItem('token') !== 'null';

//   return (
//     <Route
//       {...rest}
//       render={({ location, ...other }) => {
//         if (authenticate && isLoggedIn) {
//           return <Component location={location} {...other} />;
//         }
//         return (
//           <Redirect
//             to={{
//               pathname: '/'
//             }}
//           />
//         );
//       }}
//     />
//   );
// };
