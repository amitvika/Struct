import React from 'react';

import { Button, Paper, Grid, Typography } from '@material-ui/core';
import AddBoxIcon from '@material-ui/icons/AddBox';
import EditIcon from '@material-ui/icons/Edit';
import { useStyles } from './DetailComponent.style';

export default function DetailComponentHeader({ title }) {
  const classes = useStyles();
  return (
    <Paper className={classes.paperContainer}>
      <Typography variant="h3" className={classes.title}>
        {title}
      </Typography>

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
