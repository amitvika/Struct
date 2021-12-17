const ItemModel = require('../models/Item.model');
const ChangeTracking = require('../models/ChangeTracking.model');

const occ = {}; //nodeocc.occ;
const path = require('path');
const { getObjectId } = require('../utils/helper');
const _ = require('lodash');
const { mapItems, mapItem } = require('../map/item.map');

exports.get = async (req, res) => {
  try {
    const query = buildQuery(req);
    let result = {};

    const options = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      sort: { updatedAt: -1 },
      populate: ['created_by', 'updated_by']
    };

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

  if (req.query.isActuator) {
    query.$and.push({
      $or: [
        { 'hierarchySelections.value': 'Actuator|Rotational' },
        { 'hierarchySelections.value': 'Actuator|Linear' }
      ]
    });
  }

  // if (req.query.call_type !== 'detail') {
  //   if (req.query.is_child_item) {
  //     query.$and.push({ is_child_item: { $in: true } });
  //   } else {
  //     query.$and.push({ is_child_item: { $in: [null, false] } });
  //   }
  // }

  if (req.query.parent_id) {
    query.$and.push({
      parent_id: getObjectId(req.query.parent_id)
    });
  }

  return query;
};

exports.getAll = async (req, res) => {
  try {
    const item_type = req.query.item_type;

    let itemDetails = await ItemModel.find();

    itemDetails = itemDetails
      .filter((itemDetail) => {
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
      })
      .map((itemDetail) => ({
        itemGeometry: itemDetail.itemGeometry,
        itemTypeConfiguration: itemDetail.itemTypeConfiguration,
        name: itemDetail.name,
        fileStore: itemDetail.fileStore,
        fileGDT: itemDetail.fileGDT,
        fileUUId: itemDetail.fileUUId,
        fileMPPS: itemDetail.fileMPPS,
        fileStack: itemDetail.fileStack,
        fileKinematic: itemDetail.fileKinematic,
        distanceGap: itemDetail.distanceGap,
        angleGap: itemDetail.angleGap,
        drawLine: itemDetail.drawLine,
        fileId: itemDetail.fileId,
        hierarchySelections: itemDetail.hierarchySelections,
        stepTreeLength: itemDetail.stepTreeLength,
        classificationConfig: itemDetail.classificationConfig,
        is_child_item: itemDetail.is_child_item,
        child_item_status: itemDetail.child_item_status,
        multiAssembly: itemDetail.multiAssembly,
        filePartName: itemDetail.filePartName,
        is_archived: itemDetail.is_archived,
        actuatorAxisNumber: itemDetail.actuatorAxisNumber,
        isActuatorApplies: itemDetail.isActuatorApplies
      }));
    res.json(itemDetails);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.getOne = async (req, res) => {
  try {
    const item = await ItemModel.findById(req.params.id);

    // const factory = await FactoryModel.find({ selectedItemId: req.params.id });

    // if (factory) {
    // 	item.itemGeometry.itemType = 'Structure';
    // }
    res.json(item);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.create = async (req, res) => {
  try {
    const newItem = new ItemModel({
      name: req.body.name,
      vendorId: req.body.vendorId,
      author: req.user.id,
      multiAssembly: req.body.multiAssembly
    });

    const savedItem = await newItem.save();
    if (!savedItem) {
      throw { message: 'Unable to save' };
    }

    const changeTracking = new ChangeTracking({
      client: savedItem._id,
      update: savedItem,
      model: 'Item',
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
    const itemId = req.body.id || req.params.id;
    let updateData = req.body;

    let prevItem = await ItemModel.findById(itemId);

    if (prevItem) {
      req.body.updated_by = req.user.id;
      prevItem = await ItemModel.findByIdAndUpdate(
        itemId,
        { $set: updateData },
        { new: true }
      );
    } else {
      req.body.created_by = req.user.id;
      req.body.updated_by = req.user.id;
      await ItemModel.updateOne({ _id: itemId }, req.body, {
        upsert: true,
        new: true
      });
      prevItem = await ItemModel.findById(itemId);
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
    //console.log('From single item controller', mymapitem);
    res.json(Object.assign({}, prevItem.toObject(), mymapitem));
  } catch (error) {
    console.log('Error', error);
    return res.status(500).send({ message: 'Some unexpected error occurred' });
  }
};

exports.delete = (req, res) => {
  ItemModel.findById(req.params.id, 'deletedAt', function (err, client) {
    if (client.deletedAt == null) {
      const saveObject = {
        deletedAt: Date.now()
      };
      ItemModel.findByIdAndUpdate(req.params.id, saveObject)
        .then((saveObject) => {
          const changeTracking = new ChangeTracking({
            client: saveObject._id,
            update: saveObject,
            model: 'Item',
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
      ItemModel.findByIdAndUpdate(req.params.id, saveObject)
        .then(() => {
          const changeTracking = new ChangeTracking({
            client: saveObject.client,
            update: saveObject,
            model: 'Item',
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

const readSTEP = (req) => {
  var filename = path.join(global.MY_ROOT, req.file.path);

  return new Promise((resolve, reject) => {
    function progress(percent) {}

    occ.readSTEP(
      filename,
      async function (err, solids) {
        if (err) {
          reject(err);
        } else {
          const stepReponse = buildResponse(solids, []);
          resolve(stepReponse);
        }
      },
      progress
    );
  });
};

exports.load_cadfile = async function (req, res) {
  try {
    if (!req.file) {
      return;
    }

    let data = {};

    if (req.file.originalname.includes('.step')) {
      const stepJSON = await readSTEP(req);
      data = { stl: null, step: stepJSON };
    } else if (req.file.originalname.includes('.STL')) {
      data = { stl: req.file.filename, step: null };
    }

    const itemDetailDoc = await ItemModel.findById(req.body.itemId);

    if (itemDetailDoc && itemDetailDoc !== null) {
      await ItemModel.findByIdAndUpdate(req.body.itemId, { $set: data });
    } else {
      const itemDetail = new ItemModel({
        ...data
      });

      await itemDetail.save();
    }

    res.json({
      ...data,
      stl: data.stl
        ? `http://localhost:3000/api/stl-file/${req.file.filename}`
        : null
    });
  } catch (err) {
    res.status(500).send({ message: err.message, success: false });
  }
};

function buildResponse(solids, logs) {
  let response = { solids: [], logs: [] };
  let counter = 1;
  solids.forEach(function (solid) {
    solid.name = 'S' + counter;
    counter++;
    try {
      let mesh = occ.buildSolidMesh(solid);
      response.solids.push(mesh);
    } catch (err) {
      console.log(' EXCEPTION in MESHING ');
    }
  });
  response.logs = logs;
  return response;
}

exports.itemDetailThreejs = (req, res) => {
  const itemId = req.params.id;

  ItemModel.findById(itemId)
    .then((data) => {
      if (!data) {
        res.send({});
      } else if (data.stl) {
        res.send({
          itemId: data.itemId,
          stl: `http://localhost:3000/api/stl-file/${data.stl}`
        });
      } else {
        res.send(data);
      }
    })
    .catch((error) => {
      res.status(500).send({ message: 'Internal Server Error' });
    });
};

exports.itemGeometry = (req, res) => {
  const itemId = req.params.id;

  ItemModel.findOne(itemId)
    .then((data) => {
      if (!data) {
        res.send(null);
      } else {
        res.send({
          itemId: data._id,
          step: data.step,
          stl:
            data.stl !== null
              ? `http://localhost:3000/api/stl-file/${data.stl}`
              : null,
          itemGeometry: data.itemGeometry,
          itemTypeConfiguration: data.itemTypeConfiguration
        });
      }
    })
    .catch((error) => {
      res.status(500).send({ message: 'Internal Server Error' });
    });
};

exports.removeItemDetailThreejs = (req, res) => {
  const itemId = req.params.id;

  ItemModel.findByIdAndUpdate(
    itemId,
    { $set: { step: null, stl: null } },
    { new: true }
  )
    .then((data) => {
      res.send(data);
    })
    .catch((error) => {
      res.status(500).send({ message: 'Internal Server Error' });
    });
};

exports.updateItemGeometry = async (req, res) => {
  try {
    const data = req.body;

    let itemDetailData = await ItemModel.findById(req.params.id);

    if (itemDetailData && itemDetailData !== null) {
      itemDetailData = await ItemModel.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            step: itemDetailData.step,
            stl: itemDetailData.stl,
            itemTypeConfiguration: data.itemTypeConfiguration,
            itemGeometry: data.itemGeometry,
            selectedClientId: data.selectedClientId
          }
        },
        { new: true }
      );
    } else {
      itemDetailData = await ItemModel.create(data);
    }

    console.log('ppppp', data);
    res.send(data);
  } catch (error) {
    console.log('Error', error);
    res.status(500).send({ message: 'Internal Server Error' });
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
    console.log('------>>', error);
    return res.status(500).send({ message: 'Some unexpected error occurred' });
  }
};
