import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import '@monostruct/common/global.css';

import { Provider } from 'react-redux';
import store from './store';
import { setUser } from './actions/authActions';
import AppRoutes from './AppRoutes';
import Alert from './components/Alert';
import LoadingModal from '@monostruct/common/components/LoadingModal';
import { ColorModeContextProvider } from '@monostruct/common/themes/ColorModeContextProvider';

const App = () => {
  useEffect(() => {
    store.dispatch(setUser());
  }, []);

  return (
    <Provider store={store}>
      <ColorModeContextProvider>
        <Alert />
        <AppRoutes />
        <LoadingModal />
      </ColorModeContextProvider>
    </Provider>
  );
};

export default App;
