import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import TeamSetupAPI from '@monostruct/common/api/teamTask.api';
import { teamTaskSetupFields } from '@monostruct/common/constants/team';
import TableGridView from '@monostruct/common/components/TableGridView';
import AddUpdateModal from './AddUpdateModal';
import { fetchMyTeamAction } from '../../actions/team.action';
import AssignTeamModal from './AssignTeamModal';

const TeamTaskSetup = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMyTeamAction());
  }, []);

  return (
    <TableGridView
      title={'Team Task Setup'}
      fields={teamTaskSetupFields}
      fetchList={TeamSetupAPI.fetchTeamTask}
      upsertListItem={TeamSetupAPI.upsertTeamTask}
      AddUpdateModal={AddUpdateModal}
      isAddEditLinkVisible={true}
      isManageTeamVisible={true}
      ManageTeamModal={AssignTeamModal}
    />
  );
};

export default TeamTaskSetup;
