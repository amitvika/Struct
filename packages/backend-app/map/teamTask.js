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
        assigned_teams: this.mapTeams(get(item, 'assigned_teams', [])),
        description: item.description,
        is_archived: item.is_archived
    }
}

exports.mapTeams = (data) => {
    if (isArray(data)) {
        return data.map((item, index) => {
            return {
                name: get(item, 'name', ''),
                id: get(item, '_id', ''),
            }
        })
    }
    else {
        return []
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