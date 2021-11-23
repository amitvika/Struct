import { createTheme } from '@material-ui/core/styles';

export const lightTheme = createTheme({
  palette: {
    type: 'light',
    background: {
      default: '#f2f2f2'
    },
    primary: {
      main: '#4167B2'
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
    backgroundColor: '#252525',
    color: '#ffffff'
  },
  menuButton: {
    fontWeight: 700,
    size: '18px',
    '&:hover, &:focus': {
      background: '#5D6D7E ',
      color: '#ffffff'
    },
    marginRight: '15px'
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
