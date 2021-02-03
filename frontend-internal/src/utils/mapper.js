export const mapItems = (itemArray) => {

    if (Array.isArray(itemArray)) {
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