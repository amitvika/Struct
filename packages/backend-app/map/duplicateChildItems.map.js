
exports.mapDuplicateChildItems = (duplicateChildItems) => {
    if (!duplicateChildItems) {
        return []
    }

    duplicateChildItems = duplicateChildItems && duplicateChildItems.map(itemData => {
        return itemData && itemData.length && itemData.slice(0, 2).map(item => {
            return item;
        });
    });
    duplicateChildItems = Array.prototype.concat.apply([], duplicateChildItems);
    return duplicateChildItems && duplicateChildItems.map(childItem => {
        return `Media/${childItem[0]}/${childItem[1]}.step`
    });
}


