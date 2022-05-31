
exports.mapDuplicateItems = (duplicateItems) => {
  if (!duplicateItems) {
    return []
  }

  duplicateItems = duplicateItems && duplicateItems.map(itemData => {
    return itemData && itemData.length && itemData.slice(0, 2).map(item => {
      return item[2];
    });
  });
  return Array.prototype.concat.apply([], duplicateItems);
}