import React from 'react';

import { Button, Paper, Grid, Typography } from '@material-ui/core';
import AddBoxIcon from '@material-ui/icons/AddBox';
import EditIcon from '@material-ui/icons/Edit';
import { useStyles } from './DetailComponent.style';
import AddDesign from './AddDesignForm';

export default function DetailComponentHeader({
  title,
  isAddDesignVisible = true,
}) {
  const classes = useStyles();
  return (
    <Paper className={classes.paperContainer}>

      <Grid xs={4}>
      {isAddDesignVisible && <AddDesign />}
      </Grid>
      <Grid xs={8}>
        <Typography variant="h3" className={classes.title}>
          {title}
        </Typography>
      
      </Grid>
      {/* <Grid style={{ marginLeft: 'auto' }}>
            <Button>
              <AddBoxIcon />
            </Button>
            <Button>
              <EditIcon />
            </Button>
          </Grid> */}
    </Paper>
  );
}
