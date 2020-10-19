const AssemblyProcessModel = require("../models/AssemblyProcess.model");
const ChangeTracking = require("../models/ChangeTracking.model");

exports.get = async (req, res) => {
  try {

    let query = {};

    if (req.params.id) {
      query = { id: req.params.id }
    }

    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sort: { date: -1 },
    };

    const item = await AssemblyProcessModel.paginate(query, options)

    res.json(item);

  }
  catch (error) {
    console.log('====', error)
    res.status(500).send(error)
  };
}

exports.getAll = async (req, res) => {
  try {

    const item = await AssemblyProcessModel.find();
    res.json(item);
  }
  catch (error) {
    console.log('====', error)
    res.status(500).send(error)
  };
}


exports.create = async (req, res) => {

  try {

    const newItem = new AssemblyProcessModel({
      assemblyId: req.body.assemblyId,
      serialNumber: req.body.serialNumber,
      action: req.body.action,
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

    const updatedItem = await AssemblyProcessModel.findByIdAndUpdate(req.params.id, saveObject)

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
  AssemblyProcessModel.findById(req.params.id, "deletedAt", function (err, client) {
    console.log(client);
    if (client.deletedAt == null) {
      const saveObject = {
        deletedAt: Date.now()
      };
      AssemblyProcessModel.findByIdAndUpdate(req.params.id, saveObject)
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
      AssemblyProcessModel.findByIdAndUpdate(req.params.id, saveObject)
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