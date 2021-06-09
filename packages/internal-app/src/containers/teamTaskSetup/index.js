import React, { useState, useEffect } from "react";
import { useDispatch, } from 'react-redux'

import TeamSetupAPI from '@ravibasil/common/api/teamTask.api';
import { teamTaskSetupFields } from '@ravibasil/common/constants/team'
import TableGridView from '@ravibasil/common/components/TableGridView';
import AddUpdateModal from './AddUpdateModal';
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