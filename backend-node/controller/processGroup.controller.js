const ProcessGroup = require("../models/ProcessGroup");
const ChangeTracking = require("../models/ChangeTracking.model");
const { extractIds } = require('../utils/helper');

exports.get = async (req, res) => {
  try {
    const access = req.access;
    const userId = req.user.id;

    const ids = extractIds(access);
    const processGroups = await ProcessGroup.find({deletedAt: null})
      .populate("createdBy", "name")
      .populate("client")
      // .populate({
      //   path: "client",
      //   match: { _id: { $in: ids } }
      // })
      .sort({ date: -1 }) //sorts descending


    const filterProcessGroups = processGroups
      .filter(processGroup => {
        if (access[processGroup.client._id] || (access.PGOA_3_V && String(userId) === String(processGroup.createdBy._id))) {
          return true;
        }
        return false
      })

    res.json(filterProcessGroups);

  } catch (error) {
    console.log('--->>Error', error)
    return res
      .status(500)
      .send({ message: 'Some unexpected error occurred' })
  }
}

exports.create = (req, res) => {
  const saveObject = {
    name: req.body.name,
    createdBy: req.user.id,
    client: req.body.client
  };
  const newProcessGroup = new ProcessGroup(saveObject);
  newProcessGroup
    .save()
    .then(item => {
      const changeTracking = new ChangeTracking({
        client: item._id,
        update: saveObject,
        model: "ProcessGroup",
        updateType: "Create",
        updatedObject: item._id,
        updatedBy: req.body.user
      });
      changeTracking.save().catch(error => console.log(error));

      res.json(item);
    })
    .catch(error => console.log(error));
}

exports.update = (req, res) => {
  const saveObject = {
    name: req.body.name,
    client: req.body.client
  };
  ProcessGroup.findByIdAndUpdate(req.params.id, saveObject)
    .then(() => {
      const changeTracking = new ChangeTracking({
        client: req.body.client,
        update: saveObject,
        model: "ProcessGroup",
        updateType: "Update",
        updatedObject: req.params.id,
        updatedBy: req.user.id
      });
      changeTracking.save().catch(error => console.log(error));

      res.json({ success: true });
    })
    .catch(err => res.status(404).json({ success: false }));
}

exports.delete = (req, res) => {
  ProcessGroup.findById(req.params.id, "deletedAt", function (err, client) {
    console.log(client);
    if (client.deletedAt == null) {
      const saveObject = {
        deletedAt: Date.now()
      };
      ProcessGroup.findByIdAndUpdate(req.params.id, saveObject)
        .then(() => {
          const changeTracking = new ChangeTracking({
            client: saveObject.client,
            update: saveObject,
            model: "ProcessGroup",
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
      ProcessGroup.findByIdAndUpdate(req.params.id, saveObject)
        .then(() => {
          console.log(req.body);
          const changeTracking = new ChangeTracking({
            client: saveObject.client,
            update: saveObject,
            model: "ProcessGroup",
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
