const isArray = require('lodash/isArray');
const get = require('lodash/get');

exports.mapDocumentations = (data) => {
    if (isArray(data)) {
        return data.map((documentation, index) => {
            return this.mapDocumentation(documentation)
        })
    }
    else {
        return []
    }
}

exports.mapDocumentation = (documentation = {}) => {
    if (documentation === null) {
        return {}
    }

    return {
        id: documentation._id || documentation.id,
        name: documentation.name,
        category: documentation.category,
        note: get(documentation, 'note', ''),
        file_url: get(documentation, 'file_url', ''),
        documentation_id: get(documentation, 'client_id', []),
        created_by_name: get(documentation, 'created_by.name', ''),
        created_by: get(documentation, 'created_by._id', ''),
        updated_by_name: get(documentation, 'updated_by.name', ''),
        updated_by: get(documentation, 'updated_by._id', ''),
        is_archived: documentation.is_archived
    }
}
