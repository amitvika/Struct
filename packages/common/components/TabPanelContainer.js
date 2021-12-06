import React from 'react';
import { Paper, Grid } from '@mui/material';

export default function TabPanelContainer(props) {
  return (
    <Grid item style={{ flex: 1 }}>
      <Paper style={{ padding: 20, margin: 10 }}>{props.children}</Paper>
    </Grid>
  );
}
