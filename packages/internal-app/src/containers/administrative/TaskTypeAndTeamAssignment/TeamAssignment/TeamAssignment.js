import React from 'react';
import SelectorView from '@monostruct/common/components/SelectorView';
import UserSetupAPI from '@monostruct/common/api/teamSetup.api';
import get from 'lodash/get';
import TeamSetupAPI from '@monostruct/common/api/teamTask.api';

const TeamAssignment = ({ selectedValue }) => {
  const handleMemberSelectChange = (data) => {
    TeamSetupAPI.upsertTeamTask({
      ...selectedValue,
      assigned_teams: data
    })
      .then((res) => {
        console.log('---', res);
      })
      .catch((error) => {});
  };

  const fetchSelectedList = () => {
    return new Promise((resolve, reject) => {
      resolve(get(selectedValue, 'assigned_teams', []).map((team) => team.id));
    });
  };

  return (
    <SelectorView
      title={'Team'}
      fetchList={UserSetupAPI.fetchTeams}
      fetchSelectedList={fetchSelectedList}
      fields={[
        { title: 'ID', field: 'id' },
        { title: 'Name', field: 'name' },
        { title: 'Assigned Team', field: 'assigned_teams' }
      ]}
      mapValues={(data) => data}
      handleUpdate={handleMemberSelectChange}
      handleSelection={(data) => {}}
    />
  );
};

export default React.memo(TeamAssignment);
