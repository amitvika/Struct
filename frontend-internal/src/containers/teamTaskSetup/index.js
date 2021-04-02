import React, { useState, useEffect } from "react";

import TeamSetupAPI from '../../api/teamSetup.api';
import { teamTaskSetupFields } from '../../constants/team'
import TableGridView from '../../components/TableGridView';

const TeamTaskSetup = () => {

    return (
        <TableGridView
            title={'Team Task Setup'}
            fields={teamTaskSetupFields}
            fetchList={TeamSetupAPI.fetchTeamTask}
            upsertListItem={TeamSetupAPI.upsertTeamTask}
        />
    );
}

export default TeamTaskSetup;