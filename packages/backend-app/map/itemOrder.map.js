const isArray = require('lodash/isArray');
const get = require('lodash/get');


exports.mapItemOrders = (data) => {
  if (isArray(data)) {
    return data.map((item, index) => {
      return this.mapItemOrder(item)
    })
  }
  else {
    return []
  }
}

exports.mapItemOrder = (item = {}) => {
  if (item === null) {
    return {}
  }

  return {
    id: item._id || item.id,
    item_id: item.item_id,
    vendor_id: item.vendor_id,
    estimated_delivery_date: item.estimated_delivery_date,
    item_quantity: item.item_quantity,
    unit_cost: item.unit_cost,
    created_by_name: get(item, 'created_by.name', ''),
    created_by: get(item, 'created_by._id', ''),
    is_archived: item.is_archived,
  }
}