const AssemblyProcessModel = require("../models/AssemblyProcess.model");
const ChangeTracking = require("../models/ChangeTracking.model");

exports.get = async (req, res) => {
  try {

    const item = await AssemblyProcessModel
      .find({ assemblyId: req.params.assemblyId })
      .sort({ serialNumber: 1 })

    res.json(item)

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
    const { assembly_processes } = req.body;

    assembly_processes.map(async data => {

      const newItem = new AssemblyProcessModel({
        assemblyId: data.assemblyId,
        serialNumber: data.serialNumber,
        action: data.action,
        status: data.status,
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
    });

    res.json({ success: true });

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