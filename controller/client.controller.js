const Client = require("../models/client.model");
const ChangeTracking = require("../models/ChangeTracking.model");

exports.get = async (req, res) => {
  const access = req.access;
  const userId = req.user.id;

  try {
    let query = { $and: [] };
    query.$and.push({
      "deletedAt": { "$exists": false }
    })

    const clients = await Client.find(query)
      .populate("createdByUserId", "name")
      .sort({ date: -1 }) //sorts descending

    const filterClients = clients.filter(client => {
      if (access[client._id] || (access.PGOA_3_V && String(userId) === String(client.createdByUserId._id))) {
        return true;
      }
      return false
    })

    res.json(filterClients)

  } catch (error) {
    return res
      .status(500)
      .send({ message: 'Some unexpected error occurred' })
  }
}

exports.create = async (req, res) => {
  try {
    const saveObject = {
      name: req.body.name,
      createdByUserId: req.body.userId
    };
    const client = new Client(saveObject);
    const newClient = client.save();

    if (!newClient) {
      throw { message: 'Unable to save client' }
    }

    const changeTracking = new ChangeTracking({
      client: item._id,
      update: saveObject,
      model: "Client",
      updateType: "Create",
      updatedObject: item._id,
      updatedBy: req.body.userId
    });

    await changeTracking.save();

    res.json(newClient);
  } catch (error) {

    return res
      .status(500)
      .send({ message: error.message })
  }
}

exports.delete = (req, res) => {
  /* Client.findByIdAndRemove(req.params.id)
      .then(() => res.json({ success: true }))
      .catch(err => res.status(404).json({ success: false }));*/

  Client.findById(req.params.id, "deletedAt", function (err, client) {
    console.log(client);
    if (client.deletedAt == null) {
      const saveObject = {
        deletedAt: Date.now()
      };
      Client.findByIdAndUpdate(req.params.id, saveObject)
        .then(() => {
          const changeTracking = new ChangeTracking({
            client: req.params.id,
            update: saveObject,
            model: "Client",
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
      Client.findByIdAndUpdate(req.params.id, saveObject)
        .then(() => {
          const changeTracking = new ChangeTracking({
            client: req.params.id,
            update: saveObject,
            model: "Client",
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

exports.update = (req, res) => {
  const saveObject = {
    name: req.body.name
  };
  Client.findByIdAndUpdate(req.params.id, saveObject)
    .then(() => {
      const changeTracking = new ChangeTracking({
        client: req.params.id,
        update: saveObject,
        model: "Client",
        updateType: "Update",
        updatedObject: req.params.id,
        updatedBy: req.body.user
      });
      changeTracking.save().catch(error => console.log(error));

      res.json({ success: true });
    })
    .catch(err => res.status(404).json({ success: false }));
}