import ThemeProvider from './ThemeProvider';
// import store from '../../internal-app/src/store';
import store from '@ravibasil/internal-app/src/store'
import { Provider } from "react-redux";
import AppRoutes from './AppRoutes';
import { AuthContextProvider } from './context/AuthContext';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthContextProvider>
          <AppRoutes />
        </AuthContextProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
