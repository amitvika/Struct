import React from 'react';

import UserSetupAPI from '@monostruct/common/api/teamSetup.api';
import TableGridView from '@monostruct/common/components/TableGridView';
import { teamSetupFields } from '@monostruct/common/constants/team';
import TeamMemberModal from './TeamMemberModal';

const MyTeam = () => {
  return (
    <TableGridView
      title={'My Teams'}
      fields={teamSetupFields}
      fetchList={UserSetupAPI.fetchMyTeams}
      isCustomAddButtonVisible={false}
      ManageTeamModal={TeamMemberModal}
      isManageTeamVisible={true}
    />
  );
};

export default MyTeam;
