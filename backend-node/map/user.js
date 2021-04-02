const isArray = require('lodash/isArray');

exports.mapUsers = (data) => {
    if (isArray(data)) {
        return data.map((item, index) => {
            return this.mapUser(item)
        })
    }
    else {
        return []
    }
}


exports.mapUser = (item) => {
    return {
        id: item._id || item.id,
        name: item.name,
        is_archived: item.is_archived
    }
}
