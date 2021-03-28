import { createMuiTheme } from "@material-ui/core";

export const darkTheme = createMuiTheme({
  palette: {
    type: "dark",
    background: {
      default: "#222222"
    },
    primary: {
      main: "#000"
    }
  }
});