export const lightTheme = {
  palette: {
    mode: 'light',
    background: {
      default: '#f2f2f2'
    },
    primary: {
      main: '#4167B2'
    }
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
  }
};
