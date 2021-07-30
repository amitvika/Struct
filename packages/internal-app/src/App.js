import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import { Provider } from "react-redux";
import store from "./store";
import { setUser } from "./actions/authActions";
import AppRoutes from './routes';
import Alert from './components/Alert';
import ThemeProvider from './ThemeProvider';
import LoadingModal from "@ravibasil/common/components/LoadingModal";

const App = () => {

  useEffect(() => {
    store.dispatch(setUser());
  }, []);


  return (
    <Provider store={store}>
      <ThemeProvider>
        <>
          <Alert />
          <AppRoutes />
          <LoadingModal />
        </>
      </ThemeProvider>

    </Provider>
  );

}

export default App;
