import React from 'react';
import { Paper, Grid } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function TabContainer(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Grid item style={{ maxWidth: `${isMobile ? 'unset' : '18%'}` }}>
      <Paper style={{ padding: 20, margin: 10 }}>{props.children}</Paper>
    </Grid>
  );
}
