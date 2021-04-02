import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Spinner } from "reactstrap";
import { useHistory } from "react-router-dom";

import ViewMyProfileAPI from '../../../api/viewMyProfile.api';
import { TasksFields } from '../../../constants/tasksItem'
// import { showErrorAlert, showSuccessAlert } from '../../actions/alert.action';
import { mapTeams } from '../../../utils/mapper';
import AddEditTeamModal from './AddEditTeamModal'
import TableGridView from '../../../components/TableGridView';
import ManageTeamModal from './ManageTeamModal';


const Tasks = ({
    fields
}) => {

    return (
        <div>
            <TableGridView
                title={'Tasks'}
                fields={TasksFields}
                mapFields={mapTeams}
                fetchList={ViewMyProfileAPI.fetchTeams}
                upsertListItem={ViewMyProfileAPI.upsertTeam}
                AddUpdateModal={AddEditTeamModal}
                isManageTeamAvailable={true}
                ManageTeamModal={ManageTeamModal}
            />
        </div>
    );
}

export default Tasks;
