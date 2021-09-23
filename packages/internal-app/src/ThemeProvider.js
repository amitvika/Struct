import React from 'react';
import { MuiThemeProvider } from '@material-ui/core';
import { getThemeByName } from '@monostruct/common/themes/base';
import { useSelector } from 'react-redux';
import CssBaseline from '@material-ui/core/CssBaseline';

const ThemeProvider = (props) => {
  const themeName = useSelector((state) => state.theme.curThemeName);

  // Retrieve the theme object by theme name
  const theme = getThemeByName(themeName);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {props.children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;
