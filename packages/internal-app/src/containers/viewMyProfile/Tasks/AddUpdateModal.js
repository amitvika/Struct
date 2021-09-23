import React from 'react';
import Modal from '@monostruct/common/components/Modal';
import TaskForm from './TaskForm';

export default function AddUpdateModal({
  title,
  open,
  toggleModal,
  isEditing,
  ...rest
}) {
  return (
    <Modal
      title={`${isEditing ? 'Update' : 'Add'} ${title}`}
      open={open}
      toggleModal={toggleModal}
    >
      <TaskForm toggleModal={toggleModal} isEditing={isEditing} {...rest} />
    </Modal>
  );
}
