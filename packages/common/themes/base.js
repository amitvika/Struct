import { lightTheme } from './light';
import { darkTheme } from './dark';
import {
  createTheme
} from '@material-ui/core/styles';

export function getThemeByName(theme) {
  return createTheme(themeMap[theme]);
}
export function getThemeName(theme) {
  return theme
    ? theme.pallete
      ? theme.palleter.type
        ? theme.palleter.type
        : 'light'
      : 'light'
    : 'light';
}
const themeMap = {
  lightTheme,
  darkTheme,
};
