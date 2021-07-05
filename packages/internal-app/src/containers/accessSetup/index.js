import React, { useState, useEffect } from "react";

import AccessSetupAPI from '@ravibasil/common/api/accessSetup.api';
import TableGridView from '@ravibasil/common/components/TableGridView';
import { accessSetupFields } from '@ravibasil/common/constants/accessSetup'
import ManageAccessSetupModal from './ManageAccessSetupModal';

const TeamSetup = ({ handleTabChange }) => {

    return (
        <TableGridView
            title={'Access Setup'}
            fields={accessSetupFields}
            fetchList={AccessSetupAPI.fetchAccessSetup}
            upsertListItem={AccessSetupAPI.upsertAccessSetup}
            isManageTeamVisible={true}
            ManageTeamModal={ManageAccessSetupModal}
            handleItemClick={(id) => handleTabChange({}, 3, id)}
        />
    );
}

export default TeamSetup;
