import React, { useState, useEffect } from "react";

import TaskAPI from '../../../api/task.api';
import { TasksFields } from '../../../constants/tasksItem'

import AddUpdateModal from './AddUpdateModal'
import TableGridView from '../../../components/TableGridView';
import ManageTeamModal from './ManageTeamModal';
import { useDispatch, } from 'react-redux'
import { fetchTeamAction } from '../../../actions/team.action'

const Tasks = ({ }) => {

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchTeamAction())
    }, []);

    return (
        <div>
            <TableGridView
                title={'Tasks'}
                fields={TasksFields}
                fetchList={TaskAPI.fetchTasks}
                upsertListItem={TaskAPI.upsertTask}
                AddUpdateModal={AddUpdateModal}
                isManageTeamAvailable={true}
                ManageTeamModal={ManageTeamModal}
            />
        </div>
    );
}

export default Tasks;
