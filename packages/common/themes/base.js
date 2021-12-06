import { lightTheme } from './light';
import { darkTheme } from './dark';
import { createTheme, adaptV4Theme } from '@mui/material/styles';

export function getThemeByName(theme) {
  return createTheme(adaptV4Theme(themeMap[theme]));
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
  darkTheme
};
