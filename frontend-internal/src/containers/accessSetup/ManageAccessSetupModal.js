import React from 'react';
import Modal from '../../components/Modal';
import SelectorView from '../../components/SelectorView';
import UserSetupAPI from '../../api/teamSetup.api';
import get from 'lodash/get';

export default function ManageTeamModal({ team, toggleModal, open, handleUpdate }) {

	const handleMemberSelectChange = (data) => {
		handleUpdate({
			...team,
			members: data
		})
	}

	return (
		<Modal
			title={'Manage Access Roles'}
			open={open}
			toggleModal={toggleModal}
			style={{ marginLeft: '10%', marginRight: '10%' }}>

			<SelectorView
				title={'Team'}
				fetchList={UserSetupAPI.fetchUsers}
				alreadySelected={get(team, 'members', [])}
				fields={{ 'id': 'ID', 'name': 'Name' }}
				mapValues={(data) => data}
				handleUpdate={handleMemberSelectChange}
				handleSelection={(data) => { }}
			/>

		</Modal>
	)
}
