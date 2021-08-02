import ThemeProvider from './ThemeProvider';
import { Provider } from "react-redux";
import store from "./redux/store";
import Routes from './containers/Routes';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Routes />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
