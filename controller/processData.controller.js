const ProcessGroup = require("../models/ProcessGroup");
const ProcessData = require("../models/ProcessData");
const ItemModel = require("../models/Item.model");
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

exports.create = async (req, res) => {
  try {

    //get process group
    const processGroupData = await ProcessGroup.findById(req.body.processGroup);
    if (!processGroupData) {
      throw 'Error'
    }

    //create new item
    const newItem = new ItemModel({
      name: processGroupData.name + ' ' + req.body.process,
      vendorId: req.body.vendorId,
      author: req.user.id,
      assemblyType: 'Multi-Item Assembly'
    });
    const savedItem = await newItem.save();

    //create a new process
    const newProcessData = new ProcessData({
      process: req.body.process,
      createdBy: req.user.id,
      processGroup: req.body.processGroup,
      itemId: savedItem._id
    });
    const savedProcessData = await newProcessData.save();

    //chnage tracking data
    const changeTracking = new ChangeTracking({
      client: req.body.client,
      update: savedProcessData,
      model: "ProcessData",
      updateType: "Create",
      updatedObject: savedProcessData._id,
      updatedBy: req.user.id
    });
    await changeTracking.save();

    res.json(newProcessData);

  } catch (error) {
    res
      .status(500)
      .send({ message: 'Some Error occurred' });
  }

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
        $set: req.body
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

    res.json(processData);


  } catch (error) {
    console.log('--->>>', error)
    res.json({ success: false, message: 'Unable to update' })

  }
}