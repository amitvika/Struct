import React from 'react';
import { Paper, Grid } from '@material-ui/core';

export default function TabPanelContainer(props) {
  return (
    <Grid item style={{ flex: 1 }}>
      <Paper style={{ padding: 20, margin: 10 }} elevation={8}>
        {props.children}
      </Paper>
    </Grid>
  );
}
