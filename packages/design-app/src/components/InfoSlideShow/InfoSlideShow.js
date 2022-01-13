import * as React from 'react';
import InfoSlider from './InfoSlider';
import MainModal from '@monostruct/common/components/Modal';

export default function InfoSection({ open, handleClose }) {
  return (
    <MainModal
      open={open}
      toggleModal={handleClose}
      boxConstainerStyle={{
        padding: 0,
        overflow: 'hidden',
        border: 0,
        height: 'unset',
        minWidth: 'unset',
        borderRadius: '15px'
      }}
    >
      <InfoSlider />
    </MainModal>
  );
}
