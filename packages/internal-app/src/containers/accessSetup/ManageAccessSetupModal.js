import React, { useState, useEffect } from 'react';
import Modal from '@ravibasil/common/components/Modal';
import SelectorView from '@ravibasil/common/components/SelectorView';
import TeamSetup from '@ravibasil/common/api/teamSetup.api';
import get from 'lodash/get';

export default function ManageTeamModal({ selectedValue, toggleModal, open, handleUpdate }) {

    const [teamIdAssignedWithAccess, setTeamIdAssignedWithAccess] = useState([]);

    const handleTeamSelect = async (data) => {

        console.log('Access Setup', data)
        setTeamIdAssignedWithAccess(data)
    }

    useEffect(() => {
        handleAssignRole()
    }, [open]);

    const handleAssignRole = async () => {
        const accessId = get(selectedValue, 'id');
        if (!open && teamIdAssignedWithAccess.length > 0 && accessId) {
            await TeamSetup.assignAccessRoleToTeams({ teamIds: teamIdAssignedWithAccess, accessId });
        }
    }

    const fetchSelectedList = () => {
        return new Promise((resolve, reject) => {
            TeamSetup.fetchTeams(`accessId=${selectedValue.id}`)
                .then(res => {
                    if (res.data) {
                        resolve(res.data.map(team => team.id));
                    }
                })
                .catch(err => {
                    console.log(err)
                    resolve([]);
                })
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
                fetchList={() => TeamSetup.fetchTeams()}
                fetchSelectedList={fetchSelectedList}
                fields={[{ title: "ID", field: "id" }, { title: "Name", field: "name" }]}
                mapValues={(data) => data}
                handleUpdate={handleTeamSelect}
                handleSelection={(data) => { }}
            />

        </Modal>
    )
}
