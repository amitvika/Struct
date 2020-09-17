const ProcessData = require("../models/ProcessData");
const ChangeTracking = require("../models/ChangeTracking.model");

exports.get = (req, res) => {
  ProcessData.find({ processGroup: req.params.id })
    .populate("createdBy", "name")
    .sort({ date: 1 }) //sorts descending
    .then(clients => {
      res.json(clients);
    });
}

exports.create = (req, res) => {
  const saveObject = {
    process: req.body.process,
    createdBy: req.body.user,
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