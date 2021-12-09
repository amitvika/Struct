import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function AlertDialog({ userChoice, handleOpen, content, title }) {
  const defaultMessage = 'There is no provided message, please add one! ';
  return (
    <div>
      <Dialog
        open={handleOpen}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {title ? title : null}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {content ? content : defaultMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => userChoice('cancel')} color="primary">
            Cancel
          </Button>
          <Button onClick={() => userChoice('ok')} color="primary" autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AlertDialog;
