import React from 'react';
import Modal from '@mui/material/Modal';
import makeStyles from '@mui/styles/makeStyles';
import { Paper, Grid } from '@mui/material';
import Box from '@mui/material/Box';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
};

export default function MainModal({ title, open, toggleModal, children }) {
  return (
    <Modal
      open={open}
      onClose={toggleModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <h2 id="simple-modal-title">{title}</h2>
        <p id="simple-modal-description"></p>
        {children}
      </Box>
    </Modal>
  );
}
