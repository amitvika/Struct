const isArray = require('lodash/isArray');
const get = require('lodash/get');

exports.mapTasks = (data) => {
    if (isArray(data)) {
        return data.map((item, index) => {
            return this.mapTask(item)
        })
    }
    else {
        return []
    }
}

exports.mapTask = (item = {}) => {
    if(item === null){
        return {}
    }
    
    return {
        id: item._id || item.id,
        name: item.name,
        assigned_team_name: get(item, 'assigned_team.name', ''),
        assigned_team: get(item, 'assigned_team._id', ''),
        team_task_name: get(item, 'team_task.name', ''),
        team_task: get(item, 'team_task._id', ''),
        assigned_to_name: get(item, 'assigned_to.name', ''),
        assigned_to: get(item, 'assigned_to._id', ''),
        created_team_name: get(item, 'created_team.name', ''),
        created_team: get(item, 'created_team._id', ''),
        created_by_name: get(item, 'created_by.name', ''),
        created_by: get(item, 'created_by._id', ''),
        is_archived: item.is_archived
    }
}
