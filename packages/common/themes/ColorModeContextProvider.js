import React from 'react';
import { adaptV4Theme } from '@mui/material/styles';
import {
  ThemeProvider,
  StyledEngineProvider,
  createTheme
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { setSelectedTheme } from '../gltf/Tree/utils';
export const ColorModeContext = React.createContext({
  toggleColorMode: () => {}
});

export const ColorModeContextProvider = ({ children }) => {
  const [mode, setMode] = React.useState('light');

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          setSelectedTheme(prevMode === 'light' ? 'dark' : 'light');
          return prevMode === 'light' ? 'dark' : 'light';
        });
      }
    }),
    []
  );

  // Update the theme only if the mode changes
  const theme = React.useMemo(() => {
    //console.log('Mode to color', mode);
    setSelectedTheme(mode);
    return createTheme(adaptV4Theme(getDesignTokens(mode)));
  }, [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      {/* <StyledEngineProvider injectFirst> */}
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
      {/* </StyledEngineProvider> */}
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
    default: '#f2f2f2',
    paper: '#f2f2f2'
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
  },
  text: {
    primary: '#ffffff'
  }
};

const getDesignTokens = (mode) => ({
  palette: {
    mode,
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
      notchedOutline: {
        top: 0,
        '& legend': {
          display: 'none'
        }
      }
    }
  }
});
