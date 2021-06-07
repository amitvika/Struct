const isArray = require('lodash/isArray');
const get = require('lodash/get');


exports.mapProductDesigns = (data) => {
    if (isArray(data)) {
        return data.map((item, index) => {
            return this.mapProductDesign(item)
        })
    }
    else {
        return []
    }
}

exports.mapProductDesign = (item = {}) => {
    if (item === null) {
        return {}
    }

    return {
        id: item._id || item.id,
        name: item.name,
        design_type: item.design_type,
        created_by_name: get(item, 'created_by.name', ''),
        created_by: get(item, 'created_by._id', ''),
        updated_by_name: get(item, 'updated_by.name', ''),
        updated_by: get(item, 'updated_by._id', ''),
        is_archived: item.is_archived
    }
}