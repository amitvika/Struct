import React from "react";

import UserSetupAPI from '../../../api/teamSetup.api';
import { teamSetupFields } from '../../../constants/team'
import TableGridView from '../../../components/TableGridView';
import TeamMemberModal from './TeamMemberModal'

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
}

export default MyTeam;
