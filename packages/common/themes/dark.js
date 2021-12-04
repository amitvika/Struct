export const darkTheme = {
  palette: {
    type: 'dark',
    background: {
      default: '#000000'
    },
    primary: {
      main: '#000'
    }
  },
  typography: {
    fontSize: 12,
    fontFamily: 'Raleway, Arial',
    body1: {
      fontSize: 12
    }
  },
  header: {
    backgroundColor: '#000000',
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
