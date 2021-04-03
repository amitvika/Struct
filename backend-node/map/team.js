const isArray = require('lodash/isArray');

exports.mapTeams = (data) => {
    if (isArray(data)) {
        return data.map((item, index) => {
            return this.mapTeam(item)
        })
    }
    else {
        return []
    }
}


exports.mapTeam = (item) => {
    return {
        id: item._id || item.id,
        name: item.name,
        members: item.members,
        accessId: item.accessId,
        number_of_members: isArray(item.members) ? item.members.length + '' : 0 + '',
        is_archived: item.is_archived
    }
}
