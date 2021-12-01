const isArray = require('lodash/isArray');
const get = require('lodash/get');

exports.mapVendors = (data, host) => {
  if (isArray(data)) {
    return data.map((vendor, index) => {
      return this.mapVendor(vendor, host);
    });
  } else {
    return [];
  }
};

exports.mapVendor = (vendor = {}, host) => {
  if (vendor === null) {
    return {};
  }

  return {
    id: vendor._id || vendor.id,
    name: vendor.name,
    logo_url: vendor.logoUrl ? `http://${host}/logo/${vendor.logoName}` : '',
    logo_name: get(vendor, 'logoName', ''),
    suppliedItems: get(vendor, 'suppliedItems', []),
    created_by_name: get(vendor, 'created_by.name', ''),
    created_by: get(vendor, 'created_by._id', ''),
    updated_by_name: get(vendor, 'updated_by.name', ''),
    updated_by: get(vendor, 'updated_by._id', ''),
    is_archived: vendor.is_archived
  };
};
