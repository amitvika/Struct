import React, { useState, useEffect } from "react";
import { useDispatch } from 'react-redux'

import TableGridView from '@ravibasil/common/components/TableGridView';
import TaskAPI from '@ravibasil/common/api/task.api';
import { TasksFields } from '@ravibasil/common/constants/tasksItem'

import AddUpdateModal from './AddUpdateModal'
import ManageTaskModal from './ManageTaskModal';
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
                isManageTeamVisible={true}
                ManageTeamModal={ManageTaskModal}
            />
        </div>
    );
}

export default Tasks;
