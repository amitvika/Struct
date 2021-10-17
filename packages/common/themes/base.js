import { lightTheme } from "./light";
import { darkTheme } from "./dark";

export function getThemeByName(theme) {
  return themeMap[theme];
}
export function getThemeName(theme) {
 return theme? 
          theme.pallete?
            theme.palleter.type?
              theme.palleter.type:
            'light':
          'light':
        'light';
}
const themeMap = {
  lightTheme,
  darkTheme
};