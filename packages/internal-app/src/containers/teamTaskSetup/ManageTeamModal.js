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

	const fetchSelectedList = () => {
		return new Promise((resolve, reject) => {
			resolve(get(team, 'members', []))
		})
	}

	return (
		<Modal
			title={'Manage Team'}
			open={open}
			toggleModal={toggleModal}>

			<SelectorView
				title={'Team'}
				fetchList={UserSetupAPI.fetchUsers}
				fetchSelectedList={fetchSelectedList}
				fields={[{ title: "ID", field: "id" }, { title: "Name", field: "name" }]}
				mapValues={(data) => data.map(item => ({ ...item, id: item._id }))}
				handleUpdate={handleMemberSelectChange}
				handleSelection={(data) => { }}
			/>

		</Modal>
	)
}
