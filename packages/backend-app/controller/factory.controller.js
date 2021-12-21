const FactoryModel = require('../models/factory.model');
const ChangeTracking = require('../models/ChangeTracking.model');
const { getObjectId, createSearchQuery } = require('../utils/helper');
const { mapFactories, mapFactory } = require('../map/factories');

exports.get = async (req, res) => {
  try {
    const query = buildQuery(req);

    let factories = [];

    if (query.$and.length > 0) {
      factories = await FactoryModel.find(query)
        .populate('created_by')
        .sort({ updatedAt: -1 });
    } else {
      factories = await FactoryModel.find()
        .populate('created_by')
        .sort({ updatedAt: -1 });
    }

    res.json(mapFactories(factories));
  } catch (error) {
    return res.status(500).send({ message: 'Some unexpected error occurred' });
  }
};

const buildQuery = (req) => {
  let query = { $and: [] };

  if (req.query.factory_id) {
    query.$and.push({ _id: getObjectId(req.query.factory_id) });
  }

  if (req.query.name) {
    query.$and.push({ name: { $regex: new RegExp(`${req.query.name}`, 'i') } });
  }

  query.$and.push({ is_archived: false });

  if (req.query.full_search) {
    query.$and.push(createSearchQuery(req.query.full_search, ['name']));
  }

  return query;
};

exports.upsert = async (req, res) => {
  try {
    let actionType;
    let factory = await FactoryModel.findById(req.body.id);

    if (factory) {
      actionType = 'Update';
      req.body.created_by = factory.created_by;
      req.body.updated_by = req.user.id;

      let data = req.body;

      factory = await FactoryModel.findByIdAndUpdate(
        req.body.id,
        { $set: data },
        { new: true }
      );
    } else {
      actionType = 'Add';
      req.body.created_by = req.user.id;

      factory = await FactoryModel.create(req.body);
    }

    const changeTracking = new ChangeTracking({
      client: req.body.id,
      update: factory,
      model: 'Factory',
      updateType: actionType,
      updatedObject: req.body.id,
      updatedBy: req.user.id
    });
    await changeTracking.save();

    factory = await FactoryModel.findById(factory._id).populate('created_by');

    res.json(mapFactory(factory));
  } catch (error) {
    console.log('upsert', error);
    res.status(500).send(error);
  }
};
