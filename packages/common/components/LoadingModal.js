import React from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import makeStyles from '@mui/styles/makeStyles';
import { useSelector } from 'react-redux';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

export default function LoadingModal({ isLoading = false }) {
  const classes = useStyles();
  
  // const message = useSelector(state => state.alert.message);

  return (
    <Backdrop className={classes.backdrop} open={isLoading} >
      <CircularProgress color="inherit" />
    </Backdrop>

  );
}
