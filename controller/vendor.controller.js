const VendorModel = require("../models/Vendor.model");
const ChangeTracking = require("../models/ChangeTracking.model");

exports.get = async (req, res) => {
  try {

    let query = { deletedAt: null };
    if (req.query.search) {
      query = { $and: [{ deletedAt: null }, { name: { '$regex': new RegExp(`${req.query.search}`, "i") } }] };
    }

    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sort: { date: -1 },
    };

    const item = await VendorModel.find(query)
      .sort({ date: -1 })
      .map(data => {
        data.logoName = data.logoName;
        data.logoUrl = data.logoUrl ? `http://${req.headers.host}/logo/${data.logoName}` : '';
        return data;
      })

    res.json(item);

  }
  catch (error) {
    console.log('====', error)
    res.status(500).send(error)
  };
}

exports.getOne = (req, res) => {
  const vendorId = req.params.id;

  VendorModel.findById(vendorId)
    .then(data => {
      data.logoName = data.logoName;
      data.logoUrl = data.logoUrl ? `http://${req.headers.host}/logo/${data.logoName}` : ''
      res.send(data);
    })
    .catch(error => {
      res.status(400).send(error)
    })
}

exports.create = async (req, res) => {

  try {

    const newItem = new VendorModel({
      name: req.body.name,
      source: req.body.source,
      author: req.user.id
    });

    const savedItem = await newItem.save();
    if (!savedItem) {
      throw { message: 'Unable to save' }
    }

    const changeTracking = new ChangeTracking({
      client: savedItem._id,
      update: savedItem,
      model: "Vendor",
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
      source: req.body.source,
      logoName: req.body.logoName,
      logoUrl: req.body.logoUrl
    };

    const updatedItem = await VendorModel.findByIdAndUpdate(req.params.id, saveObject, { new: true })

    const changeTracking = new ChangeTracking({
      client: updatedItem._id,
      update: updatedItem,
      model: "Vendor",
      updateType: "Update",
      updatedObject: updatedItem._id,
      updatedBy: req.user.id
    });
    await changeTracking.save();

    res.json(updatedItem);
  }
  catch (error) {
    console.log(error)

    return res
      .status(500)
      .send({ message: 'Some unexpected error occurred' })
  }
}

exports.delete = (req, res) => {
  VendorModel.findById(req.params.id, "deletedAt", function (err, client) {
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
            model: "Vendor",
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
      VendorModel.findByIdAndUpdate(req.params.id, saveObject)
        .then(() => {
          console.log(req.body);
          const changeTracking = new ChangeTracking({
            client: saveObject.client,
            update: saveObject,
            model: "Vendor",
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