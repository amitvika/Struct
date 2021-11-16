const NewItemModel = require('../models/NewItem.model');
const ChangeTracking = require('../models/ChangeTracking.model');

const { getObjectId } = require('../utils/helper');
const _ = require('lodash');
const { mapItems, mapItem } = require('../map/item.map');

exports.upsert = async (req, res) => {
  try {
    let items = req.body || [];

    items = items.map((item) => ({
      ...item,
      created_by: item.created_by || req.user.id,
      updated_by: req.user.id
    }));

    const itemUpdated = await NewItemModel.bulkInsertItems(items);

    res.json({ success: true, itemUpdated });
  } catch (error) {
    console.log('Error', error);
    return res.status(500).send({ message: 'Some unexpected error occurred' });
  }
};
