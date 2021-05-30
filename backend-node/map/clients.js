const isArray = require('lodash/isArray');
const get = require('lodash/get');

exports.mapClients = (data) => {
    if (isArray(data)) {
        return data.map((client, index) => {
            return this.mapClient(client)
        })
    }
    else {
        return []
    }
}

exports.mapClient = (client = {}) => {
    if (client === null) {
        return {}
    }



    return {
        id: client._id || client.id,
        name: client.name,
        domain_name: get(client, 'domain_name', ''),
        is_domain_active: client.is_domain_active,
        logo_name: get(client, 'logo_url', ''),
        logo_url: get(client, 'logo_name', ''),
        linked_items: get(client, 'linked_items', []),
        created_by_name: get(client, 'created_by.name', ''),
        created_by: get(client, 'created_by._id', ''),
        updated_by_name: get(client, 'updated_by.name', ''),
        updated_by: get(client, 'updated_by._id', ''),
        is_archived: client.is_archived
    }
}
