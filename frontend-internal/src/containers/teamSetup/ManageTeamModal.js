import React from 'react';
import Modal from '../../components/Modal';
import SelectorView from '../../components/SelectorView';
import UserSetupAPI from '../../api/teamSetup.api';
import get from 'lodash/get';

export default function ManageTeamModal({ selectedValue, toggleModal, open, handleUpdate,name }) {

    const handleMemberSelectChange = (data) => {
        handleUpdate({
            ...selectedValue,
            members: data
        })

    }

    const fetchSelectedList = () => {
        return new Promise((resolve, reject) => {
            resolve(get(selectedValue, 'members', []))
            console.log(selectedValue.name)
        })
    }

    return (
        <Modal
        
            title={`Manage Team ${selectedValue ? selectedValue.name : ""}`}
            open={open}
            toggleModal={toggleModal}
            style={{ marginLeft: '10%', marginRight: '10%' }}>

            <SelectorView
                title={'Team'}
                fetchList={UserSetupAPI.fetchUsers}
                fetchSelectedList={fetchSelectedList}
                fields={{ 'id': 'ID', 'name': 'Name' }}
                mapValues={(data) => data}
                handleUpdate={handleMemberSelectChange}
                handleSelection={(data) => { }}
            />
        </Modal>
    )
}
