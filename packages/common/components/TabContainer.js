import React from 'react';
import { Paper, Grid } from '@material-ui/core';

export default function TabContainer(props) {
  return (
    <Grid item style={{maxWidth: '18%'}}>
      <Paper style={{ padding: 20, margin: 10 }}>{props.children}</Paper>
    </Grid>
  );
}
