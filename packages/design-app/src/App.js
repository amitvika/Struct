import { ColorModeContextProvider } from '@monostruct/common/themes/ColorModeContextProvider';
import AppRoutes from './AppRoutes';
import { AuthContextProvider } from '@monostruct/common/context/AuthContext';
import '@monostruct/common/global.css';

function App() {
  return (
    <AuthContextProvider>
      <ColorModeContextProvider>
        <AppRoutes />
      </ColorModeContextProvider>
    </AuthContextProvider>
  );
}

export default App;
