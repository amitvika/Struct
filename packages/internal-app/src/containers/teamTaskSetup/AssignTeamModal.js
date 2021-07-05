import React from 'react';
import Modal from '@ravibasil/common/components/Modal';
import SelectorView from '@ravibasil/common/components/SelectorView';
import UserSetupAPI from '@ravibasil/common/api/teamSetup.api';
import get from 'lodash/get';

export default function AssignTeamModal({ selectedValue, toggleModal, open, handleUpdate }) {

	const handleMemberSelectChange = (data) => {
		handleUpdate({
			...selectedValue,
			assigned_teams: data
		})
	}

	const fetchSelectedList = () => {
		return new Promise((resolve, reject) => {
			resolve(get(selectedValue, 'assigned_teams', []).map(team => team.id))
		})
	}

	return (
		<Modal
			title={'Assign Team'}
			open={open}
			toggleModal={toggleModal}>

			<SelectorView
				title={'Team'}
				fetchList={UserSetupAPI.fetchTeams}
				fetchSelectedList={fetchSelectedList}
				fields={[{ title: "ID", field: "id" }, { title: "Name", field: "name" },{ title: "Assigned Team", field: "assigned_teams" }]}
				mapValues={(data) => data}
				handleUpdate={handleMemberSelectChange}
				handleSelection={(data) => { }}
                // maxSelectedCount={1}
			/>

		</Modal>
	)
}
