import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import '@monostruct/common/global.css';

import { Provider } from 'react-redux';
import store from './store';
import AppRoutes from './AppRoutes';
import Alert from './components/Alert';
import LoadingModal from '@monostruct/common/components/LoadingModal';
import { ColorModeContextProvider } from '@monostruct/common/themes/ColorModeContextProvider';
import { AuthContextProvider } from '@monostruct/common/context/AuthContext';

const App = () => {
  return (
    <Provider store={store}>
      <AuthContextProvider>
        <ColorModeContextProvider>
          <Alert />
          <AppRoutes />
          <LoadingModal />
        </ColorModeContextProvider>
      </AuthContextProvider>
    </Provider>
  );
};

export default App;
