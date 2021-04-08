import React, { useState, useEffect } from "react";

import TaskAPI from '../../../api/task.api';
import { TasksFields } from '../../../constants/tasksItem'

import AddUpdateModal from './AddUpdateModal'
import TableGridView from '../../../components/TableGridView';
import ManageTaskModal from './ManageTaskModal';
import { useDispatch, } from 'react-redux'
import { fetchMyTeamAction } from '../../../actions/team.action'

const Tasks = ({ }) => {

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchMyTeamAction());

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
                ManageTeamModal={ManageTaskModal}
            />
        </div>
    );
}

export default Tasks;
