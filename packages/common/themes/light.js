import { createMuiTheme } from '@material-ui/core';

export const lightTheme = createMuiTheme({
    palette: {
        type: 'light',
        background: {
            default: "#ffffff"
        },
        primary: {
            main: '#4167B2'
        },
    },
    typography: {
        fontSize: 12,
        fontFamily: 'Raleway, Arial',
        body1: {
            fontSize: 12,
        }
    },
    header: {
        backgroundColor: '#252525',
        color: '#ffffff'
    },
    menuButton:  {
        fontWeight: 700,
        size: "18px",
        '&:hover, &:focus': {
            background: "#5D6D7E ",
            color: '#ffffff'
         }
    },
    overrides: {
        MuiOutlinedInput: {
            root: {
                "& $notchedOutline": {
                    top: 0
                },
            }
        }
    }
});