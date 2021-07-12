const isArray = require('lodash/isArray');
const get = require('lodash/get');


exports.mapFactories = (data) => {
    if (isArray(data)) {
        return data.map((item, index) => {
            return this.mapFactory(item)
        })
    }
    else {
        return []
    }
}

exports.mapFactory = (item = {}) => {
    if (item === null) {
        return {}
    }

    return {
        id: item._id || item.id,
        name: item.name,
        created_by_name: get(item, 'created_by.name', ''),
        created_by: get(item, 'created_by._id', ''),
        is_archived: item.is_archived,
    }
}