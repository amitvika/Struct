import { ThemeContextProvider } from '@monostruct/common/themes/ThemeContextProvider';
import AppRoutes from './AppRoutes';
import { AuthContextProvider } from './context/AuthContext';

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
