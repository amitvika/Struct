import { SET_THEME } from "../actions/types";


export default function themeReducer(state = {  }, action) {
    switch (action.type) {
        case SET_THEME:
            localStorage.setItem("appTheme", action.payload.themeName || "lightTheme");
            return {
                curThemeName: action.payload.themeName || "lightTheme"
            };
        default: {
            return {
                curThemeName: localStorage.getItem("appTheme") || "lightTheme"
            }

        }
    }
}
