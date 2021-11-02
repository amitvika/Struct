const isArray = require('lodash/isArray');
const get = require('lodash/get');

exports.mapVendors = (data) => {
  if (isArray(data)) {
    return data.map((vendor, index) => {
      return this.mapVendor(vendor);
    });
  } else {
    return [];
  }
};

exports.mapVendor = (vendor = {}) => {
  if (vendor === null) {
    return {};
  }

  return {
    id: vendor._id || vendor.id,
    name: vendor.name,
    logo_url: get(vendor, 'logo_url', ''),
    logo_name: get(vendor, 'logo_name', ''),
    suppliedItems: get(vendor, 'suppliedItems', []),
    created_by_name: get(vendor, 'created_by.name', ''),
    created_by: get(vendor, 'created_by._id', ''),
    updated_by_name: get(vendor, 'updated_by.name', ''),
    updated_by: get(vendor, 'updated_by._id', ''),
    is_archived: vendor.is_archived
  };
};
