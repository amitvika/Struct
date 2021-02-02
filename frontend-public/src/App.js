import React from 'react';
import Home from './pages/home';
import Header from './containers/Header';
import Footer from './containers/Footer';
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";



function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <Switch>
          <Route path="/home" component={Home} />
        </Switch>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
