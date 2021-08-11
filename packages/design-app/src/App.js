import ThemeProvider from './ThemeProvider';
import { Provider } from "react-redux";
import store from "./redux/store";
import AppRoutes from './AppRoutes';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
