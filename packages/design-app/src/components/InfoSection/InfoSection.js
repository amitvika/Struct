import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import InfoSlider from './InfoSlider';

export default function InfoSection({ open, handleClose }) {
  return (
    <Dialog open={open} onClose={handleClose}>
      <InfoSlider />
    </Dialog>
  );
}
