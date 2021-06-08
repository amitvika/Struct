import React from 'react';
import Modal from '@ravibasil/common/components/Modal';

export default function TeamMemberModal({ selectedValue, toggleModal, open }) {

	return (
		<Modal
			title={'Team Members'}
			open={open}
			toggleModal={toggleModal}
			style={{ marginLeft: '10%', marginRight: '10%' }}>

		</Modal>
	)
}
