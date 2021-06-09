import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { Provider } from "react-redux";
import store from "./store";
import { loadUser } from "./actions/authActions";
import AppRoutes from './routes';
import Alert from './components/Alert';
import ThemeProvider from './ThemeProvider';

const App = () => {

//   useEffect(() => {
//     store.dispatch(loadUser());
//   }, []);


  return (
    <Provider store={store}>
      <ThemeProvider>
        <>
          <Alert />   
          <AppRoutes />
        </>
      </ThemeProvider>

    </Provider>
  );

}

export default App;
