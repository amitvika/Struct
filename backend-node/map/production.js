const isArray = require('lodash/isArray');
const get = require('lodash/get');

exports.mapProductions = (data) => {
    if (isArray(data)) {
        return data.map((item, index) => {
            return this.mapProduction(item)
        })
    }
    else {
        return []
    }
}

exports.mapProduction = (item = {}) => {
    if (item === null) {
        return {}
    }

    return {
        id: item._id || item.id,
        name: item.name,
        quantity: item.quantity,
        start_date: item.start_date,
        end_date: item.end_date,
        factory_id: item.factory_id,
        created_by_name: get(item, 'created_by.name', ''),
        created_by: get(item, 'created_by._id', ''),
        is_archived: item.is_archived
    }
}
