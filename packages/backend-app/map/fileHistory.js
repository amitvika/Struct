const get = require('lodash/get');

exports.mapFileHistory = (file_history) => {
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