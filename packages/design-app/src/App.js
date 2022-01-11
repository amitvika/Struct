import { ColorModeContextProvider } from '@monostruct/common/themes/ColorModeContextProvider';
import AppRoutes from './AppRoutes';
import { AuthContextProvider } from '@monostruct/common/context/AuthContext';
import '@monostruct/common/global.css';
import { AlertContextProvider } from '@monostruct/common/context/AlertContext/AlertContext';

function App() {
  return (
    <AuthContextProvider>
      <ColorModeContextProvider>
        <AlertContextProvider>
          <AppRoutes />
        </AlertContextProvider>
      </ColorModeContextProvider>
    </AuthContextProvider>
  );
}

export default App;
