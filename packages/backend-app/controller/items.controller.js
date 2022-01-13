const ItemModel = require('../models/Item.model');
const ChangeTracking = require('../models/ChangeTracking.model');
const { getObjectId, isObjectIdValid } = require('../utils/helper');
const _ = require('lodash');
const { mapItems, mapItem } = require('../map/item.map');

exports.get = async (req, res) => {
  try {
    const query = buildQuery(req);
    let result = {};

    const options = {
      sort: { updatedAt: -1 },
      populate: ['created_by', 'updated_by']
    };

    if (req.query.page) {
      options.page = req.query.page;
    }

    if (req.query.limit) {
      options.limit = req.query.limit;
    }

    if (!req.query.limit) {
      options.pagination = false;
    }

    if (query.$and.length > 0) {
      result = await ItemModel.paginate(query, options);
    } else {
      result = await ItemModel.paginate({}, options);
    }

    result.docs = await mapItems(result.docs);

    if (req.query.page || req.query.limit) {
      return res.json(result);
    }

    res.json(result.docs);
  } catch (error) {
    res.status(500).send(error);
  }
};

const buildQuery = (req) => {
  let query = { $and: [] };

  if (req.query.id) {
    query.$and.push({ _id: getObjectId(req.query.id) });
  }

  if (req.query.search) {
    query.$and.push({
      name: { $regex: new RegExp(`${req.query.search}`, 'i') }
    });
  }

  if (req.query.itemType) {
    query.$and.push({
      'itemGeometry.itemType': {
        $regex: new RegExp(`${req.query.itemType}`, 'i')
      }
    });
  }

  if (req.query.itemCategory) {
    query.$and.push({
      'itemGeometry.generalGeomerty': {
        $regex: new RegExp(`${req.query.itemCategory}`, 'i')
      }
    });
  }

  if (req.query.multiAssembly) {
    query.$and.push({
      multiAssembly: req.query.multiAssembly
    });
  }

  if (req.query.client_id) {
    query.$and.push({
      selectedClientId: getObjectId(req.query.client_id)
    });
  }

  if (req.query.vendorId) {
    query.$and.push({
      vendorId: getObjectId(req.query.vendorId)
    });
  }

  // if (req.query.hasOwnProperty('is_actuator_type')) {
  //   query.$and.push({
  //     is_actuator_type: req.query.is_actuator_type
  //   });
  // }

  if (req.query.full_search) {
    query.$and.push(createSearchQuery(req.query.full_search));
  }

  if (req.query.parent_id) {
    query.$and.push({
      parent_id: getObjectId(req.query.parent_id)
    });
  }

  if (req.query.hasOwnProperty('not_for_public_use')) {
    query.$and.push({
      not_for_public_use: req.query.not_for_public_use
    });
  }

  return query;
};

const createSearchQuery = (queryValue) => {
  let filterQuery = { $or: [] };

  if (isObjectIdValid(queryValue)) {
    filterQuery.$or.push({ _id: queryValue });
    filterQuery.$or.push({ parent_id: queryValue });
  } else {
    filterQuery.$or.push({
      name: {
        $regex: new RegExp(`${queryValue}`, 'i')
      }
    });
  }

  return filterQuery;
};

exports.getAll = async (req, res) => {
  try {
    const item_type = req.query.item_type;

    let itemDetails = await ItemModel.find();

    itemDetails = itemDetails.filter((itemDetail) => {
      if (itemDetail.step === null && itemDetail === null) {
        return false;
      }
      if (item_type === 'Work Holding 1') {
        if (
          itemDetail.itemTypeConfiguration &&
          itemDetail.itemTypeConfiguration.itemType ===
            'Machine - Tool/Workholding'
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    });
    res.json(mapItems(itemDetails));
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.update = async (req, res) => {
  try {
    const itemId = req.body.id || req.params.id;
    let updateData = req.body;

    let prevItem;
    if (isObjectIdValid(itemId)) {
      prevItem = await await ItemModel.findById(itemId);
    }

    if (prevItem) {
      prevItem = prevItem.toObject();
    }

    if (prevItem) {
      updateData.created_by = prevItem.created_by;
      updateData.updated_by = req.user.id;

      updateData.actuator_motion_control = Object.assign(
        {},
        prevItem.actuator_motion_control,
        updateData.actuator_motion_control
      );

      prevItem = await ItemModel.findByIdAndUpdate(
        itemId,
        { $set: updateData },
        { new: true }
      );
    } else if (isObjectIdValid(itemId)) {
      updateData.created_by = req.user.id;
      updateData.updated_by = req.user.id;
      await ItemModel.updateOne({ _id: itemId }, updateData, {
        upsert: true,
        new: true
      });
      prevItem = await ItemModel.findById(itemId);
    } else {
      updateData.created_by = req.user.id;
      updateData.updated_by = req.user.id;
      prevItem = await ItemModel.create({ ...updateData });
    }

    const changeTracking = new ChangeTracking({
      client: prevItem._id,
      update: prevItem,
      model: 'Item',
      updateType: 'Upsert',
      updatedObject: prevItem._id,
      updatedBy: req.user.id
    });
    await changeTracking.save();
    let mymapitem = await mapItem(prevItem);

    res.json(Object.assign({}, prevItem.toObject(), mymapitem));
  } catch (error) {
    console.log('Error', error);
    return res.status(500).send({ message: 'Some unexpected error occurred' });
  }
};

exports.upsert = async (req, res) => {
  try {
    let items = req.body || [];

    items = items.map((item) => ({
      ...item,
      created_by: item.created_by || req.user.id,
      updated_by: req.user.id
    }));

    const itemUpdated = await ItemModel.bulkInsertItems(items);

    res.json({ success: true, itemUpdated });
  } catch (error) {
    return res.status(500).send({ message: 'Some unexpected error occurred' });
  }
};

exports.removeChildItems = async (req, res) => {
  try {
    await ItemModel.deleteMany({ parent_id: getObjectId(req.params.id) });

    let itemUpdated = await ItemModel.findByIdAndUpdate(
      itemId,
      { $set: { child_item_status: 'NOT_INITIATED' } },
      { new: true }
    );
    res.json({ success: true, itemUpdated });
  } catch (error) {
    return res.status(500).send({ message: 'Child Item removed' });
  }
};
