import { createMuiTheme } from "@material-ui/core";

export const darkTheme = createMuiTheme({
    palette: {
        type: "dark",
        background: {
            default: "#222222"
        },
        primary: {
            main: "#000"
        },

    },
    typography: {
        fontSize: 12,
        fontFamily: 'Raleway, Arial',
    }
});