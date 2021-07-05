const isArray = require('lodash/isArray');
const get = require('lodash/get');

exports.mapAccessSetups = (data) => {
    if (isArray(data)) {
        return data.map((item, index) => {
            return this.mapAccessSetup(item)
        })
    }
    else {
        return []
    }
}


exports.mapAccessSetup = (item) => {
    return {
        id: item._id || item.id,
        name: item.name,
        is_archived: item.is_archived,
        email: get(item, 'created_by.email', '')
    }
}