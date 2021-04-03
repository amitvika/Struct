import React from 'react';
import Modal from '../../../components/Modal'
import SelectorView from '../../../components/SelectorView';
import UserSetupAPI from '../../../api/viewMyProfile.api';
import get from 'lodash/get';
import { Tab } from "@material-ui/core";

export default function ManageTeamModal({ team, toggleModal, open, handleUpdate }) {

	const handleMemberSelectChange = (data) => {
		handleUpdate({
			...team,
			members: data
		})
	}
	
	const fetchSelectedList=() =>{
		return new Promise((resolve, reject) =>{
			resolve(get(team, 'members', []))
		})
	}

	return (
		<Modal
			title={'Manage Team'}
			open={open}
			toggleModal={toggleModal}>
			<Tab label="Description" value={1} />
			<Tab label="Interactive Task" value={2} />

			<SelectorView
				title={'Team'}
				fetchList={UserSetupAPI.fetchUsers}
				fetchSelectedList={fetchSelectedList}
				fields={{ 'id': 'ID', 'name': 'Name' }}
				mapValues={(data) => data.map(item => ({ ...item, id: item._id }))}
				handleUpdate={handleMemberSelectChange}
				handleSelection={(data) => { }}
			/>


		</Modal>
	)
}
