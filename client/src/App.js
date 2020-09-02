import React, { useEffect } from "react";
// import Pages from "./components/Pages";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
//redux
import { Provider } from "react-redux";
import store from "./store";
//reduxEnd
import { loadUser } from "./actions/authActions";
import AppRoutes from './routes';

const App = () => {

  useEffect(() => {
    store.dispatch(loadUser());
  }, []);
  

  return (
    <Provider store={store}>
      <div className="App">
        <AppRoutes />
      </div>
    </Provider>
  );

}

export default App;
