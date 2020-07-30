import React from "react";

import Pages from "./components/Pages";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
//redux
import { Provider } from "react-redux";
import store from "./store";
//reduxEnd
import { loadUser } from "./actions/authActions";

class App extends React.Component {
  componentDidMount() {
    store.dispatch(loadUser());
  }
  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <Pages />
        </div>
      </Provider>
    );
  }
}

export default App;
