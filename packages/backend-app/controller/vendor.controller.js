const VendorModel = require('../models/Vendor.model');
const ChangeTracking = require('../models/ChangeTracking.model');
const { mapVendor, mapVendors } = require('../map/vendor.map');
const { createSearchQuery } = require('../utils/helper');

exports.get = async (req, res) => {
  try {
    let query = buildQuery(req);

    if (query.$and.length > 0) {
      vendor = await VendorModel.find(query)
        .populate('created_by')
        .sort({ updatedAt: -1 });
    } else {
      vendor = await VendorModel.find()
        .populate('created_by')
        .sort({ updatedAt: -1 });
    }

    res.json(mapVendors(vendor, req.headers.host));
  } catch (error) {
    console.log('====', error);
    res.status(500).send(error);
  }
};

const buildQuery = (req) => {
  let query = { $and: [] };

  if (req.query.full_search) {
    query.$and.push(createSearchQuery(req.query.full_search, ['name']));
  }

  return query;
};

exports.getOne = (req, res) => {
  const vendorId = req.params.id;

  VendorModel.findById(vendorId)
    .then((data) => {
      data.logoName = data.logoName;
      data.logoUrl = data.logoUrl
        ? `http://${req.headers.host}/logo/${data.logoName}`
        : '';
      res.send(data);
    })
    .catch((error) => {
      res.status(400).send(error);
    });
};

exports.create = async (req, res) => {
  try {
    const newItem = new VendorModel({
      name: req.body.name,
      source: req.body.source,
      author: req.user.id
    });

    const savedItem = await newItem.save();
    if (!savedItem) {
      throw { message: 'Unable to save' };
    }

    const changeTracking = new ChangeTracking({
      client: savedItem._id,
      update: savedItem,
      model: 'Vendor',
      updateType: 'Create',
      updatedObject: savedItem._id,
      updatedBy: req.user.id
    });
    await changeTracking.save();

    res.json(savedItem);
  } catch (error) {
    console.log(error);

    return res.status(500).send({ message: 'Some unexpected error occurred' });
  }
};

exports.update = async (req, res) => {
  try {
    const saveObject = {
      name: req.body.name,
      source: req.body.source,
      logoName: req.body.logoName,
      logoUrl: req.body.logoUrl,
      suppliedItems: req.body.suppliedItems
    };

    const updatedItem = await VendorModel.findByIdAndUpdate(
      req.params.id,
      saveObject,
      { new: true }
    );

    const changeTracking = new ChangeTracking({
      client: updatedItem.id,
      update: updatedItem,
      model: 'Vendor',
      updateType: 'Update',
      updatedObject: updatedItem.id,
      updatedBy: req.user.id
    });
    await changeTracking.save();

    res.json(updatedItem);
  } catch (error) {
    console.log(error);

    return res.status(500).send({ message: 'Some unexpected error occurred' });
  }
};

exports.delete = (req, res) => {
  VendorModel.findById(req.params.id, 'deletedAt', function (err, client) {
    console.log(client);
    if (client.deletedAt == null) {
      const saveObject = {
        deletedAt: Date.now()
      };
      VendorModel.findByIdAndUpdate(req.params.id, saveObject)
        .then(() => {
          const changeTracking = new ChangeTracking({
            client: saveObject._id,
            update: saveObject,
            model: 'Vendor',
            updateType: 'Delete',
            updatedObject: req.params.id,
            updatedBy: req.user.id
          });
          changeTracking.save().catch((error) => console.log(error));

          res.json({ success: true });
        })
        .catch((err) => res.status(404).json({ success: false }));
    } else {
      const saveObject = {
        deletedAt: null
      };
      VendorModel.findByIdAndUpdate(req.params.id, saveObject)
        .then(() => {
          console.log(req.body);
          const changeTracking = new ChangeTracking({
            client: saveObject.client,
            update: saveObject,
            model: 'Vendor',
            updateType: 'Un-Delete',
            updatedObject: req.params.id,
            updatedBy: req.user.id
          });
          changeTracking.save().catch((error) => console.log(error));

          res.json({ success: true });
        })
        .catch((err) => res.status(404).json({ success: false }));
    }
  });
};

exports.upsert = async (req, res) => {
  try {
    let vendor = await VendorModel.findById(req.body.id);

    if (vendor) {
      req.body.updated_by = req.user.id;

      if (!req.body.created_by) {
        req.body.created_by = req.user.id;
      }

      vendor = await VendorModel.findByIdAndUpdate(
        req.body.id,
        { $set: req.body },
        { new: true }
      );
    } else {
      req.body.created_by = req.user.id;
      req.body.updated_by = req.user.id;
      vendor = await VendorModel.create(req.body);
    }

    const changeTracking = new ChangeTracking({
      client: req.body.id,
      update: vendor,
      model: 'Vendor',
      updateType: 'Upsert',
      updatedObject: req.body.id,
      updatedBy: req.user.id
    });
    await changeTracking.save();

    res.json(mapVendor(vendor));
  } catch (error) {
    console.log('upsert', error);
    res.status(500).send(error);
  }
};
