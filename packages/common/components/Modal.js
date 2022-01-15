import React from 'react';
import Modal from '@mui/material/Modal';
import makeStyles from '@mui/styles/makeStyles';
import { Paper, Grid } from '@mui/material';
import Box from '@mui/material/Box';

const style = {
  position: 'absolute',
  height: '70%',
  minWidth: '50%',
  overflowX: 'scroll',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  width: '50%'
};

export default function MainModal({
  title,
  open,
  toggleModal,
  children,
  boxConstainerStyle = {}
}) {
  return (
    <Modal
      open={open}
      onClose={toggleModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Box sx={{ ...style, ...boxConstainerStyle }}>
        {title && <h2 id="simple-modal-title">{title}</h2>}
        {children}
      </Box>
    </Modal>
  );
}
