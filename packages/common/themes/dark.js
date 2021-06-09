import { createMuiTheme } from "@material-ui/core";

export const darkTheme = createMuiTheme({
    palette: {
        type: "dark",
        background: {
            default: "#000000"
        },
        primary: {
            main: "#000"
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
        backgroundColor: '#000000',
        color: '#ffffff'
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