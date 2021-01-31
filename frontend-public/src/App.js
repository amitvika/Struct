import React from 'react';
import Home from './pages/home';
import Header from './containers/Header';
import Footer from './containers/Footer';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <Home />
      <Footer />
    </div>
  );
}

export default App;
