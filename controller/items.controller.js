const ItemModel = require("../models/Item.model");
const ChangeTracking = require("../models/ChangeTracking.model");
const ItemGeometryModel = require('../models/ItemGeometry.model')

const nodeocc = require("node-occ");
const occ = nodeocc.occ;
const path = require('path');

exports.get = async (req, res) => {
  try {

    let query = {};

    if (req.query.vendorId) {
      query = { vendorId: req.query.vendorId }
    }

    const options = {
      page: req.query.page,
      limit: req.query.limit,
      populate: 'vendorId',
      sort: { date: -1 },
    };

    const item = await ItemModel.paginate(query, options)

    res.json(item);

  }
  catch (error) {
    console.log('====', error)
    res.status(500).send(error)
  };
}

exports.getAll = async (req, res) => {
  try {

    const item = await ItemModel.find();
    res.json(item);
  }
  catch (error) {
    console.log('====', error)
    res.status(500).send(error)
  };
}

exports.getOne = async (req, res) => {
  try {

    const item = await ItemModel.findById(req.params.id);
    res.json(item);
  }
  catch (error) {
    console.log('====', error)
    res.status(500).send(error)
  };
}

exports.create = async (req, res) => {

  try {

    const newItem = new ItemModel({
      name: req.body.name,
      vendorId: req.body.vendorId,
      author: req.user.id
    });

    const savedItem = await newItem.save();
    if (!savedItem) {
      throw { message: 'Unable to save' }
    }

    const changeTracking = new ChangeTracking({
      client: savedItem._id,
      update: savedItem,
      model: "Item",
      updateType: "Create",
      updatedObject: savedItem._id,
      updatedBy: req.user.id
    });
    await changeTracking.save();

    res.json(savedItem);

  }
  catch (error) {
    console.log(error)

    return res
      .status(500)
      .send({ message: 'Some unexpected error occurred' })
  }
}

exports.update = async (req, res) => {
  try {

    const saveObject = {
      name: req.body.name,
      source: req.body.source
    };

    const updatedItem = await ItemModel.findByIdAndUpdate(req.params.id, saveObject)

    const changeTracking = new ChangeTracking({
      client: updatedItem._id,
      update: updatedItem,
      model: "Item",
      updateType: "Update",
      updatedObject: updatedItem._id,
      updatedBy: req.user.id
    });
    await changeTracking.save();

    res.json({ success: true });
  }
  catch (error) {
    console.log(error)

    return res
      .status(500)
      .send({ message: 'Some unexpected error occurred' })
  }
}

exports.delete = (req, res) => {
  ItemModel.findById(req.params.id, "deletedAt", function (err, client) {
    console.log(client);
    if (client.deletedAt == null) {
      const saveObject = {
        deletedAt: Date.now()
      };
      ItemModel.findByIdAndUpdate(req.params.id, saveObject)
        .then(() => {
          const changeTracking = new ChangeTracking({
            client: saveObject._id,
            update: saveObject,
            model: "Item",
            updateType: "Delete",
            updatedObject: req.params.id,
            updatedBy: req.user.id
          });
          changeTracking.save().catch(error => console.log(error));

          res.json({ success: true });
        })
        .catch(err => res.status(404).json({ success: false }));
    } else {
      const saveObject = {
        deletedAt: null
      };
      ItemModel.findByIdAndUpdate(req.params.id, saveObject)
        .then(() => {
          console.log(req.body);
          const changeTracking = new ChangeTracking({
            client: saveObject.client,
            update: saveObject,
            model: "Item",
            updateType: "Un-Delete",
            updatedObject: req.params.id,
            updatedBy: req.user.id
          });
          changeTracking.save().catch(error => console.log(error));

          res.json({ success: true });
        })
        .catch(err => res.status(404).json({ success: false }));
    }
  });
}


exports.load_cadfile = function (req, res) {

  var filename = path.join(global.MY_ROOT, req.file.path);

  function progress(percent) {
    // console.log(" -----------------> ", percent);
  }

  occ.readSTEP(filename, async function (err, solids) {
    if (err) {
      console.log(" readStep has failed", err.message);
      res.status(501).send("Error building solid : " + err.message + "    " + err.stack);
    } else {
      console.log(" readStep has succeeded");
      const stepReponse = buildResponse(solids, []);

      const itemGeometryDoc = await ItemGeometryModel.findOne({ itemId: req.body.itemId });

      if (itemGeometryDoc && itemGeometryDoc !== null) {
        ItemGeometryModel.findOneAndUpdate({ itemId: req.body.itemId }, { $set: { step: stepReponse } })
          .then(data => {
            res.send(stepReponse);
          })
          .catch(error => {
            console.log('error', error)
          })
      }
      else {
        const itemGeometry = new ItemGeometryModel({
          itemId: req.body.itemId,
          step: stepReponse
        });

        itemGeometry.save()
          .then(data => {
            res.send(stepReponse);
          })
          .catch(error => {
            console.log('error', error)
          })
      }

    }
  }, progress);
};


function buildResponse(solids, logs) {

  let response = { solids: [], logs: [] };
  let counter = 1;
  solids.forEach(function (solid) {
    solid.name = "S" + counter;
    counter++;
    try {
      let mesh = occ.buildSolidMesh(solid);
      response.solids.push(mesh);
    }
    catch (err) {
      console.log(" EXCEPTION in MESHING ");
    }
  });
  response.logs = logs;
  return response;
}

exports.itemGeometry = (req, res) => {
  const itemId = req.params.id;

  ItemGeometryModel.findOne({ itemId })
    .then(data => {
      if (!data) {
        res.send({});
      }
      else {
        res.send(data);
      }
    })
    .catch(error => {
      res.status(500).send({ message: 'Internal Server Error' })
    })
}

exports.removeItemGeometry = (req, res) => {
  const itemId = req.params.id;

  ItemGeometryModel.findOneAndUpdate({ itemId }, { $set: { step: {} } })
    .then(data => {
      res.send(data);
    })
    .catch(error => {
      res.status(500).send({ message: 'Internal Server Error' })
    })
}

exports.updateItemGeometry = (req, res) => {
  const itemId = req.params.id;
  const data = req.body;

  ItemGeometryModel.findOneAndUpdate({ itemId }, { $set: data }, { new: true })
    .then(data => {
      console.log('ppppp', data)
      res.send(data);
    })
    .catch(error => {
      console.log('Error', error)
      res.status(500).send({ message: 'Internal Server Error' })
    })
}
