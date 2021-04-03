import React from 'react';
import Modal from '../../../components/Modal';
// import UserSetupAPI from '../../api/teamSetup.api';
// import get from 'lodash/get';

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
