import React from 'react';
import SelectorView from '@monostruct/common/components/SelectorView';
import UserSetupAPI from '@monostruct/common/api/teamSetup.api';
import get from 'lodash/get';
import TeamSetupAPI from '@monostruct/common/api/teamTask.api';
import { AlertContext } from '@monostruct/common/context/AlertContext/AlertContextProvider';

const TeamAssignment = ({ selectedValue, setSelectedValue }) => {
  const alertContext = React.useContext(AlertContext);

  const handleMemberSelectChange = (data) => {
    TeamSetupAPI.upsertTeamTask({
      ...selectedValue,
      assigned_teams: data
    })
      .then((res) => {
        if (get(res, 'data')) {
          setSelectedValue(get(res, 'data'));
          alertContext.openSuccessAlert({
            message: 'Task successully assigned'
          });
        } else {
          alertContext.openErrorAlert({ message: 'Unable to save info' });
        }
      })
      .catch((error) =>
        alertContext.openErrorAlert({ message: 'Unable to save info' })
      );
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
