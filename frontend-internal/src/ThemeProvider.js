import React, { useState } from 'react';
import { MuiThemeProvider } from "@material-ui/core";
import { getThemeByName } from './themes/base';
import { useSelector } from 'react-redux';

const ThemeProvider = (props) => {
    const themeName =  useSelector(state => state.theme.curThemeName)
    
    // Retrieve the theme object by theme name
    const theme = getThemeByName(themeName);

    return (
        <MuiThemeProvider theme={theme}>{props.children}</MuiThemeProvider>
    );
}

export default ThemeProvider;