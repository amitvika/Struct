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
            }
        })
    }
    else {
        return []
    }
} 