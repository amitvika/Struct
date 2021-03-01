import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Spinner } from "reactstrap";
import { useHistory } from "react-router-dom";

import UserSetupAPI from '../../api/userSetup.api';
import { teamSetupFields } from '../../constants/team'
import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';
import { mapTeams } from '../../utils/mapper';
import AddEditTeamModal from './AddEditTeamModal';
import TableGridView from '../../components/TableGridView';
import ManageTeamModal from './ManageTeamModal';

const TeamSetup = ({
    fields
}) => {

    return (
        <TableGridView
            title={'Team Setup'}
            fields={teamSetupFields}
            mapFields={mapTeams}
            fetchList={UserSetupAPI.fetchTeams}
            upsertListItem={UserSetupAPI.upsertTeam}
            AddUpdateModal={AddEditTeamModal}
            isManageTeamAvailable={true}
            ManageTeamModal={ManageTeamModal}
        />
    );
}

export default TeamSetup;
