import React, { useState, useEffect } from "react";

import TeamSetupAPI from '../../api/teamSetup.api';
import { teamTaskSetupFields } from '../../constants/team'
import TableGridView from '../../components/TableGridView';
import AddUpdateModal from './AddUpdateModal';
import { useDispatch, } from 'react-redux'
import { fetchTeamAction } from '../../actions/team.action'

const TeamTaskSetup = () => {
    const dispatch = useDispatch();
    
    useEffect(() => {
        dispatch(fetchTeamAction())
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