import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    width: '100%',
    height: '100%',
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: 'translateZ(0)',
    justifyContent: 'space-around',
    overflow:'hidden'
  }
}));

export default function List(props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <GridList cellHeight={200} spacing={1} className={classes.gridList}>
        {props.children}
      </GridList>
    </div>
  );
}
