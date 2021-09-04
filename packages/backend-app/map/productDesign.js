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
        type: item.type,
        category: item.category,
        notes: item.notes,
        created_at: item.createdAt,
        // file_history: fileHistory(item.file_history),
        // created_by_name: get(item, 'created_by.name', ''),
        // created_by: get(item, 'created_by._id', ''),
        // updated_by_name: get(item, 'updated_by.name', ''),
        // updated_by: get(item, 'updated_by._id', ''),
        hierarchySchema: get(item, 'hierarchySchema', []),
        criteriaSchema: get(item, 'criteriaSchema', {}),
        is_archived: item.is_archived
    }
}

const fileHistory = (file_history) => {
    if (!file_history) {
        return []
    }

    return file_history.map(item => {
        return {
            file_url: item.file_url,
            file_name: item.file_name,
            loaded_by: get(item, 'loaded_by._id'),
            loaded_by_name: get(item, 'loaded_by.name'),
            cleared_by: get(item, 'cleared_by._id'),
            cleared_by_name: get(item, 'cleared_by.name'),
            loaded_at: item.loaded_at,
            cleared_at: item.cleared_at,
        }
    })

}