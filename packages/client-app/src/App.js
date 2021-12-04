import React from 'react';
import './App.css';
import Routes from './containers/Routes';
import { ThemeContextProvider } from '@monostruct/common/themes/ThemeContextProvider';
import { AuthContextProvider } from '@monostruct/common/context/AuthContext';

function App() {
  return (
    <ThemeContextProvider>
      <AuthContextProvider>
        <Routes />
      </AuthContextProvider>
    </ThemeContextProvider>
  );
}

export default App;
