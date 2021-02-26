import isArray from 'lodash/isArray'
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
                category : item.category,
                note: item.note,
                file_url: item.file_url,
                created_by: item?.created_by?.name,
                updated_by: item?.updated_by?.name
            }
        })
    }
    else {
        return []
    }
} 