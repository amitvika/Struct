import React, { useState, useEffect } from "react";

import UserSetupAPI from '../../api/teamSetup.api';
import { teamSetupFields } from '../../constants/team'
import TableGridView from '../../components/TableGridView';
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
            isManageTeamAvailable={true}
            ManageTeamModal={ManageTeamModal}
        />
    );
}

export default TeamSetup;
