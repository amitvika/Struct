import isArray from 'lodash/isArray';

export const mapItems = (itemArray) => {

    if (isArray(itemArray)) {
        return itemArray.map((item, index) => {
            return {
                id: item._id,
                name: item.name,
                source: item?.vendorId?.name || 'STRUCT',
                assemblyType: item.assemblyType
            }
        });
    }
    else {
        return []
    }
}

export const mapDocumentations = (data) => {
    if (isArray(data)) {
        return data.map((item, index) => {
            return {
                id: item._id,
                name: item.name,
                category: item.category,
                note: item.note,
                file_url: item.file_url,
                created_by: item?.created_by?.name,
                updated_by: item?.updated_by?.name,
                is_archived: item?.is_archived
            }
        })
    }
    else {
        return []
    }
}

export const mapTeams = (data) => {
    if (isArray(data)) {
        return data.map((item, index) => {
            return {
                id: item._id || item.id,
                name: item.name,
                members: item.members,
                number_of_members: isArray(item.members) ? item.members.length + '' : 0 + '',
                is_archived: item?.is_archived
            }
        })
    }
    else {
        return []
    }
} 
