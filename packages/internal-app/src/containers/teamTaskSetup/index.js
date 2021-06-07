import React, { useState, useEffect } from "react";

import TeamSetupAPI from '../../api/teamTask.api';
import { teamTaskSetupFields } from '../../constants/team'
import TableGridView from '../../components/TableGridView';
import AddUpdateModal from './AddUpdateModal';
import { useDispatch, } from 'react-redux'
import { fetchMyTeamAction } from '../../actions/team.action'

const TeamTaskSetup = () => {
    const dispatch = useDispatch();
    
    useEffect(() => {
        dispatch(fetchMyTeamAction())
    }, []);
   
    return (
        <TableGridView
            title={'Team Task Setup'}
            fields={teamTaskSetupFields}
            fetchList={TeamSetupAPI.fetchTeamTask}
            upsertListItem={TeamSetupAPI.upsertTeamTask}
            AddUpdateModal={AddUpdateModal}
        
        />
    );
}

export default TeamTaskSetup;