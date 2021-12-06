import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
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
  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

const lightModePallete = {
  primary: {
    main: '#ba000d'
  },
  background: {
    paper: '#000000',
    default: '#f2f2f2'
  }
};

const darkModePallete = {
  primary: {
    main: '#000000'
  },
  background: {
    default: '#000000'
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
  header: {
    backgroundColor: '#252525',
    color: '#ffffff'
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
  },
  components: {
    // Name of the component
    MuiToolbar: {
      styleOverrides: {
        // Name of the slot
        root: {
          // Some CSS
          background: '#252525',
          color: '#ffffff'
        }
      }
    },
    MuiPaper: {
      defaultProps: {
        backgroundColor: '#424242'
      }
    }
  }
});
