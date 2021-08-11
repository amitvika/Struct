import ThemeProvider from './ThemeProvider';

import AppRoutes from './AppRoutes';
import { AuthContextProvider } from './context/AuthContext'

function App() {
  return (
    <ThemeProvider>
      <AuthContextProvider>
        <AppRoutes />
      </AuthContextProvider>
    </ThemeProvider>
  );
}

export default App;
