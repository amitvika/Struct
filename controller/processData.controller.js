const ProcessData = require("../models/ProcessData");
const ChangeTracking = require("../models/ChangeTracking.model");

exports.get = (req, res) => {
  ProcessData.find({ processGroup: req.params.id })
    .populate("createdBy", "name")
    .populate("itemId")
    .sort({ date: 1 }) //sorts descending
    .then(clients => {
      res.json(clients);
    });
}

exports.getOne = (req, res) => {
  ProcessData.findById(req.params.id)
    .populate("createdBy", "name")
    .populate("itemId")
    .sort({ date: 1 }) //sorts descending
    .then(clients => {
      res.json(clients);
    });
}

exports.create = (req, res) => {
  const saveObject = {
    process: req.body.process,
    createdBy: req.user.id,
    processGroup: req.body.processGroup
  };
  const newProcessData = new ProcessData(saveObject);
  newProcessData
    .save()
    .then(item => {
      const changeTracking = new ChangeTracking({
        client: req.body.client,
        update: saveObject,
        model: "ProcessData",
        updateType: "Create",
        updatedObject: item._id,
        updatedBy: req.body.user
      });
      changeTracking.save().catch(error => console.log(error));

      res.json(item);
    })
    .catch(error => console.log(error));
}

exports.delete = (req, res) => {

  ProcessData.findByIdAndRemove(req.params.id)
    .then(item => {
      res.json({ success: true, message: 'Successfully deleted' });
    })
    .catch(error => {
      console.log(error);
      res.json({ success: false, message: 'Unable to delete' })
    });
}

exports.update = async (req, res) => {
  try {

    const processData = await ProcessData.findByIdAndUpdate(req.params.id,
      {
        $set: {
          itemId: req.body.itemId
        }
      },
      { new: true });

    const changeTracking = new ChangeTracking({
      client: req.user.id,
      update: processData,
      model: "ProcessData",
      updateType: "Update",
      updatedObject: processData._id,
      updatedBy: req.user.id
    });
    await changeTracking.save()

    res.json({ success: true, message: 'Successfully updated' });


  } catch (error) {
    console.log('--->>>', error)
    res.json({ success: false, message: 'Unable to update' })

  }
}