const isArray = require('lodash/isArray');

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


exports.mapTeamTask = (item) => {
    return {
        id: item._id || item.id,
        name: item.name,
        description: item.description,
        is_archived: item.is_archived
    }
}