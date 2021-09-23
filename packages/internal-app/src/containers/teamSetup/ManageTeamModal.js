import React from 'react';
import Modal from '@monostruct/common/components/Modal';
import SelectorView from '@monostruct/common/components/SelectorView';
import UserSetupAPI from '@monostruct/common/api/teamSetup.api';
import get from 'lodash/get';

export default function ManageTeamModal({
  selectedValue,
  toggleModal,
  open,
  handleUpdate,
  name,
}) {
  const handleMemberSelectChange = (data) => {
    handleUpdate({
      ...selectedValue,
      members: data,
    });
  };

  const fetchSelectedList = () => {
    return new Promise((resolve, reject) => {
      resolve(get(selectedValue, 'members', []));
      console.log(selectedValue.name);
    });
  };

  return (
    <Modal
      title={`Manage Team ${selectedValue ? selectedValue.name : ''}`}
      open={open}
      toggleModal={toggleModal}
      style={{ marginLeft: '10%', marginRight: '10%' }}
    >
      <SelectorView
        title={'Users'}
        fetchList={UserSetupAPI.fetchUsers}
        fetchSelectedList={fetchSelectedList}
        fields={[
          { title: 'ID', field: 'id' },
          { title: 'Name', field: 'name' },
          { title: 'E-mail', field: 'email' },
        ]}
        mapValues={(data) => data}
        handleUpdate={handleMemberSelectChange}
        handleSelection={(data) => {}}
      />
    </Modal>
  );
}
