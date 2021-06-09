import { SET_THEME } from "./types";

export const setThemeAction = ({ themeName }) => {
    return {
        type: SET_THEME,
        payload: { themeName }
    };
};
