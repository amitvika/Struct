import React from 'react';
import { ThemeProvider, StyledEngineProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { getThemeByName } from '@monostruct/common/themes/base';

export const ThemeContext = React.createContext({});

export const ThemeContextProvider = ({ children }) => {
  // Read current theme from localStorage or maybe from an api
  const currentTheme = localStorage.getItem('appTheme') || 'light';

  // State to hold the selected theme name
  const [themeName, _setThemeName] = React.useState(currentTheme);

  // Wrap _setThemeName to store new theme names in localStorage
  const setThemeName = (name) => {
    localStorage.setItem('appTheme', name);
    _setThemeName(name);
  };

  const toggleTheme = () => {
    setThemeName(themeName === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ themeName, setThemeName, toggleTheme }}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={getThemeByName(themeName)}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </StyledEngineProvider>
    </ThemeContext.Provider>
  );
};
