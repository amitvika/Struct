
import React, { useState, useEffect } from "react";

import UserSetupAPI from '../../../api/teamSetup.api';
import { teamSetupFields } from '../../../constants/team'
import TableGridView from '../../../components/TableGridView';
import TeamMemberModal from './TeamMemberModal'

const MyTeam = ({ }) => {

    return (
        <TableGridView
            title={'My Teams'}
            fields={teamSetupFields}
            fetchList={UserSetupAPI.fetchMyTeams}
            isCustomAddButtonVisible={false}
            ManageTeamModal={TeamMemberModal}
            isManageTeamAvailable={true}
        />
    );
}

export default MyTeam;
