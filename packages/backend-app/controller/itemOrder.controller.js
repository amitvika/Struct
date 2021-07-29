const ItemOrderModel = require("../models/itemOrder.modal");
const ChangeTracking = require("../models/ChangeTracking.model");
const { getObjectId } = require('../utils/helper')
const { mapItemOrder, mapItemOrders } = require('../map/itemOrder.map');

exports.get = async (req, res) => {
  try {

    const query = buildQuery(req)

    let orders = [];

    if (query.$and.length > 0) {
      orders = await ItemOrderModel
        .find(query)
        .sort({ updatedAt: -1 })

    }
    else {
      orders = await ItemOrderModel
        .find()
        .sort({ updatedAt: -1 })

    }

    res.json(mapItemOrders(orders));

  }
  catch (error) {
    console.log('get', error)
    res.status(500).send(error)
  };
}

const buildQuery = (req) => {
  let query = { $and: [] };

  if (req.query.id) {
    query.$and.push({ _id: getObjectId(req.query.id) });
  }

  if (req.query.item_id) {
    query.$and.push({ item_id: getObjectId(req.query.item_id) });
  }

  if (req.query.vendor_id) {
    query.$and.push({ vendor_id: { '$regex': new RegExp(`${req.query.vendor_id}`, "i") } })
  }

  query.$and.push({ is_archived: false });

  return query
}

exports.upsert = async (req, res) => {
  try {
    let actionType;
    let order = await ItemOrderModel.findById(req.body.id);

    if (order) {
      actionType = "Update";
      req.body.created_by = order.created_by;
      req.body.updated_by = req.user.id;

      let data = req.body;

      order = await ItemOrderModel.findByIdAndUpdate(
        req.body.id,
        { $set: data },
        { new: true });
    }
    else {
      actionType = "Add";
      req.body.created_by = req.user.id;

      order = await ItemOrderModel.create(req.body);
    }

    const changeTracking = new ChangeTracking({
      client: req.body.id,
      update: order,
      model: "Order",
      updateType: actionType,
      updatedObject: req.body.id,
      updatedBy: req.user.id
    });
    await changeTracking.save();

    order = await ItemOrderModel.findById(order._id)

    res.json(mapItemOrder(order))
  }
  catch (error) {
    console.log('upsert', error)
    res.status(500).send(error)
  };
}

