import React from 'react';
import { adaptV4Theme } from '@mui/material/styles';
import {
  ThemeProvider,
  StyledEngineProvider,
  createTheme
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { purple } from '@mui/material/colors';

export const ColorModeContext = React.createContext({
  toggleColorMode: () => {}
});

export const ColorModeContextProvider = ({ children }) => {
  const [mode, setMode] = React.useState('light');

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      }
    }),
    []
  );

  // Update the theme only if the mode changes
  const theme = React.useMemo(
    () => createTheme(adaptV4Theme(getDesignTokens(mode))),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </StyledEngineProvider>
    </ColorModeContext.Provider>
  );
};

const lightModePallete = {
  primary: {
    main: '#424242',
    dark: '#000'
  },
  secondary: {
    main: '#424242',
    dark: '#000'
  },
  background: {
    default: '#252525',
    paper: '#ffffff'
  }
};

const darkModePallete = {
  primary: {
    main: '#424242',
    dark: '#000'
  },
  secondary: {
    main: '#424242',
    dark: '#000'
  },
  background: {
    default: '#000000',
    paper: '#252525'
  }
};

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    // appBarBlack: {
    //   main: '#000000',
    //   contrastText: '#ffffff'
    // },
    ...(mode === 'light' ? lightModePallete : darkModePallete)
  },
  typography: {
    fontSize: 14,
    fontFamily: 'Raleway, Arial',
    body1: {
      fontSize: 14
    }
  },
  menuButton: {
    fontWeight: 700,
    size: '18px',
    '&:hover, &:focus': {
      background: '#5D6D7E ',
      color: '#ffffff'
    }
  },
  overrides: {
    MuiOutlinedInput: {
      root: {
        '& $notchedOutline': {
          top: 0
        }
      }
    }
  }
});
