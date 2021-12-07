import React from 'react';

import { Button, Paper, Grid, Typography } from '@mui/material';
import AddBoxIcon from '@mui/icons-material/AddBox';
import EditIcon from '@mui/icons-material/Edit';
import { useStyles } from './DetailComponent.style';
import AddDesign from './AddDesignForm';

export default function DetailComponentHeader({
  title,
  isAddDesignVisible = true
}) {
  const classes = useStyles();
  return (
    <Paper
      className={classes.paperContainer}
      style={{ justifyContent: 'unset', alignItems: 'center' }}
    >
      <div style={{ zIndex: 9 }}>{isAddDesignVisible && <AddDesign />}</div>
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%'
        }}
      >
        <Typography variant="h4" className={classes.title}>
          {title}
        </Typography>
      </div>
    </Paper>
  );
}
