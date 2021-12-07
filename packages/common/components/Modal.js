import React from 'react';
import Modal from '@mui/material/Modal';
import Backdrop from '@mui/material/Backdrop';
import Fade from '@mui/material/Fade';
import makeStyles from '@mui/styles/makeStyles';
import { Paper, Grid } from '@mui/material';
import ClickAwayListener from '@mui/material/ClickAwayListener';

const useStyles = makeStyles((theme) => ({
  modal: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    overflow: 'scroll',
    display: 'block'
  },
  paper: {
    display: 'block',
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    marginLeft: '20%',
    marginRight: '20%',
    // width: '100%',
    minHeight: '60%'
  }
}));

export default function MainModal({
  title,
  open,
  toggleModal,
  children,
  style = {}
}) {
  const classes = useStyles();

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      className={classes.modal}
      // style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      open={open}
      onClose={toggleModal}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500
      }}
    >
      <Fade in={open}>
        <Paper className={classes.paper} style={{ ...style }}>
          <h2 id="simple-modal-title">{title}</h2>
          <p id="simple-modal-description"></p>
          {children}
        </Paper>
      </Fade>
    </Modal>
  );
}
