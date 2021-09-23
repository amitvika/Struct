const ItemModel = require('../models/Item.model');
const FactoryModel = require('../models/factory.model');
const ChangeTracking = require('../models/ChangeTracking.model');

// const nodeocc = require("node-occ");
const occ = {}; //nodeocc.occ;
const path = require('path');
const { getObjectId } = require('../utils/helper');
const _ = require('lodash');

exports.get = async (req, res) => {
  try {
    const query = buildQuery(req);

    let items = [];

    if (query.length > 0) {
      items = await ItemModel.aggregate(query);
    } else {
      items = await ItemModel.find();
    }

    res.json(items);
  } catch (error) {
    res.status(500).send(error);
  }
};

const buildQuery = (req) => {
  let query = [];

  if (req.query.id) {
    query.push({ $match: { _id: getObjectId(req.query.id) } });
  }

  if (req.query.search) {
    query.push({
      $match: { name: { $regex: new RegExp(`${req.query.search}`, 'i') } },
    });
  }

  if (req.query.itemType) {
    query.push({
      $match: {
        'itemGeometry.itemType': {
          $regex: new RegExp(`${req.query.itemType}`, 'i'),
        },
      },
    });
  }

  if (req.query.itemCategory) {
    query.push({
      $match: {
        'itemGeometry.generalGeomerty': {
          $regex: new RegExp(`${req.query.itemCategory}`, 'i'),
        },
      },
    });
  }

  if (req.query.assemblyType) {
    query.push({
      $match: {
        assemblyType: req.query.assemblyType,
      },
    });
  }

  if (req.query.client_id) {
    query.push({
      $match: {
        selectedClientId: getObjectId(req.query.client_id),
      },
    });
  }

  if (req.query.vendorId) {
    query.push({
      $match: {
        vendorId: getObjectId(req.query.vendorId),
      },
    });
  }

  query.push({ $sort: { date: -1 } });
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
        fileMPPS: itemDetail.fileMPPS,
        fileStack: itemDetail.fileStack,
        fileKinematic: itemDetail.fileKinematic,
        fileId: itemDetail.fileId,
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
      assemblyType: req.body.assemblyType,
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
      updatedBy: req.user.id,
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
    const body = req.body;

    let updateData = {};
    if (body.name) {
      updateData.name = body.name;
    }
    if (body.itemTypeConfiguration) {
      updateData.itemTypeConfiguration = body.itemTypeConfiguration;
    }
    if (body.itemGeometry) {
      updateData.itemGeometry = body.itemGeometry;
    }
    if (body.source) {
      updateData.source = body.source;
    }
    if (body.assemblyType) {
      updateData.assemblyType = body.assemblyType;
    }
    if (body.selectedClientId) {
      updateData.selectedClientId = body.selectedClientId;
    }

    if (body.multiAssmebly) {
      updateData.assemblyType = 'Multi-Item Assembly';
    }

    if (body.fileId) {
      updateData.fileId = body.fileId || null;
      updateData.fileStore = body.fileStore;
      updateData.fileGDT = body.fileGDT;
      updateData.fileMPPS = body.fileMPPS;
      updateData.fileStack = body.fileStack;
      updateData.fileKinematic = body.fileKinematic;
    }

    if (
      (body.itemGeometry && body.itemGeometry.isEndProductSelected === false) ||
      body.selectedClientId === null
    ) {
      updateData.selectedClientId = null;
    }

    if (body.compliance) {
      updateData.compliance = body.compliance;
    }
    if (body.dispensing) {
      updateData.dispensing = body.dispensing;
    }
    if (body.fullProcess) {
      updateData.fullProcess = body.fullProcess;
    }
    if (body.storage) {
      updateData.storage = body.storage;
    }

    const updatedItem = await ItemModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    const changeTracking = new ChangeTracking({
      client: updatedItem._id,
      update: updatedItem,
      model: 'Item',
      updateType: 'Update',
      updatedObject: updatedItem._id,
      updatedBy: req.user.id,
    });
    await changeTracking.save();

    res.json(updatedItem);
  } catch (error) {
    return res.status(500).send({ message: 'Some unexpected error occurred' });
  }
};

exports.delete = (req, res) => {
  ItemModel.findById(req.params.id, 'deletedAt', function (err, client) {
    if (client.deletedAt == null) {
      const saveObject = {
        deletedAt: Date.now(),
      };
      ItemModel.findByIdAndUpdate(req.params.id, saveObject)
        .then((saveObject) => {
          const changeTracking = new ChangeTracking({
            client: saveObject._id,
            update: saveObject,
            model: 'Item',
            updateType: 'Delete',
            updatedObject: req.params.id,
            updatedBy: req.user.id,
          });
          changeTracking.save().catch((error) => console.log(error));

          res.json({ success: true });
        })
        .catch((err) => res.status(404).json({ success: false }));
    } else {
      const saveObject = {
        deletedAt: null,
      };
      ItemModel.findByIdAndUpdate(req.params.id, saveObject)
        .then(() => {
          const changeTracking = new ChangeTracking({
            client: saveObject.client,
            update: saveObject,
            model: 'Item',
            updateType: 'Un-Delete',
            updatedObject: req.params.id,
            updatedBy: req.user.id,
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
        ...data,
      });

      await itemDetail.save();
    }

    res.json({
      ...data,
      stl: data.stl
        ? `http://localhost:3000/api/stl-file/${req.file.filename}`
        : null,
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
          stl: `http://localhost:3000/api/stl-file/${data.stl}`,
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
          itemTypeConfiguration: data.itemTypeConfiguration,
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
            selectedClientId: data.selectedClientId,
          },
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
