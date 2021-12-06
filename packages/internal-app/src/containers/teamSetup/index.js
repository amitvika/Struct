import React, { useState, useEffect } from 'react';

import UserSetupAPI from '@monostruct/common/api/teamSetup.api';
import TableGridView from '@monostruct/common/components/TableGridView';
import { teamSetupFields } from '@monostruct/common/constants/team';
import ManageTeamModal from './ManageTeamModal';

const TeamSetup = ({ fields }) => {
  return (
    <TableGridView
      title={'Team User Assignments'}
      fields={teamSetupFields}
      fetchList={UserSetupAPI.fetchTeams}
      upsertListItem={UserSetupAPI.upsertTeam}
      isManageTeamVisible={true}
      ManageTeamModal={ManageTeamModal}
    />
  );
};

export default TeamSetup;
