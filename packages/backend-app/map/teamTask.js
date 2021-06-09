const isArray = require('lodash/isArray');
const get = require('lodash/get');

exports.mapTeamTasks = (data) => {
    if (isArray(data)) {
        return data.map((item, index) => {
            return this.mapTeamTask(item)
        })
    }
    else {
        return []
    }
}


exports.mapTeamTask = (item = {}) => {
    return {
        id: item._id || item.id,
        name: item.name,
        teamName: get(item, 'teamId.name', ''),
        teamId: get(item, 'teamId._id', ''),
        description: item.description,
        is_archived: item.is_archived
    }
}


exports.mapMyTeamTasks = (data) => {
    if (isArray(data)) {
        return data.map((item, index) => {
            return {
                ...this.mapTeamTask(get(item, 'teamtasks', {})),
                team_name: get(item, 'name', ''),
                teamId: get(item, '_id', ''),
            }
        })
    }
    else {
        return []
    }
}