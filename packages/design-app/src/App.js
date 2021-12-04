import { ThemeContextProvider } from '@monostruct/common/themes/ThemeContextProvider';
import AppRoutes from './AppRoutes';
import { AuthContextProvider } from '@monostruct/common/context/AuthContext';
import '@monostruct/common/global.css';

function App() {
  return (
    <ThemeContextProvider>
      <AuthContextProvider>
        <AppRoutes />
      </AuthContextProvider>
    </ThemeContextProvider>
  );
}

export default App;
