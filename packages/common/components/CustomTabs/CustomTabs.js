import React, { useState, useReducer } from 'react';

import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

export const CustomTabs = ({ children }) => {
  return (
    <Grid container spacing={3}>
      {children}
    </Grid>
  );
};

export const CustomTab = ({
  label,
  tabIndex,
  selectedTabIndex,
  handleTabChange
}) => {
  return (
    <Grid item xs="auto" key={`custom-tab-${tabIndex}`}>
      <Paper
        onClick={() => handleTabChange(tabIndex)}
        sx={{
          textAlign: 'center',
          cursor: 'pointer',
          transition: '0.3s',
          '&:hover, &:focus': {
            backgroundColor: '#3369FF'
          },
          ...(tabIndex === selectedTabIndex && {
            backgroundColor: '#3369FF',
            color: 'white'
          }),
          margin: 0
        }}
      >
        {label}
      </Paper>
    </Grid>
  );
};

export const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};
