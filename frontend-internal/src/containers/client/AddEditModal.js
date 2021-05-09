import React from 'react'
import MainModal from '../../components/Modal';

export default function AddEditModal({
    isAddEditClientModalOpened,
    toggleAddEditClientModal
}) {
    return (
        <MainModal open={isAddEditClientModalOpened} toggleModal={toggleAddEditClientModal} >
            Hello
        </MainModal>
    )
}
