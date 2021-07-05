import React, { useState, useEffect } from "react";

import UserSetupAPI from '@ravibasil/common/api/teamSetup.api';
import TableGridView from '@ravibasil/common/components/TableGridView';
import { teamSetupFields } from '@ravibasil/common/constants/team'
import ManageTeamModal from './ManageTeamModal';

const TeamSetup = ({
    fields
}) => {

    return (
        <TableGridView
            title={'Team Setup'}
            fields={teamSetupFields}
            fetchList={UserSetupAPI.fetchTeams}
            upsertListItem={UserSetupAPI.upsertTeam}
            isManageTeamVisible={true}
            ManageTeamModal={ManageTeamModal}
        />
    );
}

export default TeamSetup;
