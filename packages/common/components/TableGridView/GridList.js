import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import ImageList from '@mui/material/ImageList';

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
      <ImageList cellHeight={200} spacing={1} className={classes.gridList}>
        {props.children}
      </ImageList>
    </div>
  );
}
