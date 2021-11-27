import React from 'react';
import { Paper, Grid } from '@material-ui/core';
import { useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';

export default function TabContainer(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Grid item style={{ maxWidth: `${isMobile ? 'unset' : '18%'}` }}>
      <Paper style={{ padding: 20, margin: 10 }}>{props.children}</Paper>
    </Grid>
  );
}
