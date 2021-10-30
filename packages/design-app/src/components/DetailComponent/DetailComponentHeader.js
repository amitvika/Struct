import React from 'react';

import { Button, Paper, Grid, Typography } from '@material-ui/core';
import AddBoxIcon from '@material-ui/icons/AddBox';
import EditIcon from '@material-ui/icons/Edit';
import { useStyles } from './DetailComponent.style';
import AddDesign from './AddDesignForm';

export default function DetailComponentHeader({
  title,
  isAddDesignVisible = true
}) {
  const classes = useStyles();
  return (
    <Paper className={classes.paperContainer}>
      <div style={{ position: 'absolute', left: '0px' }}>
        {isAddDesignVisible && <AddDesign />}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Typography variant="h4" className={classes.title}>
          {title}
        </Typography>
      </div>
    </Paper>
  );
}
