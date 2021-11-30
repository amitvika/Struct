import React from 'react';
import './App.css';
import Routes from './containers/Routes';
import { ThemeProvider, createTheme } from '@mui/material/styles';

export const ColorModeContext = React.createContext({
  toggleColorMode: () => {}
});

function ToggleColorMode(props) {
  const [mode, setMode] = React.useState('light');
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      }
    }),
    []
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode
        }
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
}

function App() {
  return (
    <ToggleColorMode>
      <Routes />
    </ToggleColorMode>
  );
}

export default App;
