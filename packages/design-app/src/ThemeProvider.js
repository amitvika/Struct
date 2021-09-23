import React from 'react';
import { MuiThemeProvider } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import { getThemeByName } from '@monostruct/common/themes/base';

const ThemeProvider = (props) => {
  const themeName = 'lightTheme';

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
