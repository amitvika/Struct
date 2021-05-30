import React, { useState, useEffect } from "react";

import AccessSetupAPI from '../../api/accessSetup.api';
import { accessSetupFields } from '../../constants/accessSetup'
import TableGridView from '../../components/TableGridView';
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
