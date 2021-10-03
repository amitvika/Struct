const CriteriaUploadModel = require("../models/criteriaUpload.modal");
const ChangeTracking = require("../models/ChangeTracking.model");
const FileHistoryModel = require("../models/fileHistory.modal");
const { getObjectId } = require('../utils/helper')
const { mapProductDesign, mapProductDesigns } = require('../map/productDesign');
const _ = require('lodash');

exports.get = async (req, res) => {
  try {

    const query = buildQuery(req)

    let productDesigns = [];

    if (query.$and.length > 0) {
      productDesigns = await CriteriaUploadModel
        .find(query)
        // .populate('file_history.loaded_by')
        // .populate('file_history.cleared_by')
        .sort({ updatedAt: -1 })

    }
    else {
      productDesigns = await CriteriaUploadModel
        .find()
        // .populate('file_history.loaded_by')
        // .populate('file_history.cleared_by')
        .sort({ updatedAt: -1 })

    }

    res.json(mapProductDesigns(productDesigns));

  }
  catch (error) {
    console.log('get', error)
    res.status(500).send(error)
  };
}

const buildQuery = (req) => {
  let query = { $and: [] };

  if (req.query.id) {
    query.$and.push({ _id: getObjectId(req.query.id) });
  }

  if (req.query.design_type) {
    query.$and.push({ design_type: design_type });
  }

  if (req.query.name) {
    query.$and.push({ name: { '$regex': new RegExp(`${req.query.name}`, "i") } })
  }

  query.$and.push({ is_archived: false });

  return query
}

exports.upsert = async (req, res) => {
  try {
    let actionType;
    let productDesign = await CriteriaUploadModel.findById(req.body.id);

    if (productDesign) {
      actionType = "Update";
      req.body.updated_by = req.user.id;
      let data = req.body;

      // data.file_history = fileHistoryPayload(req, productDesign);
      productDesign = await CriteriaUploadModel.findByIdAndUpdate(
        req.body.id,
        { $set: data },
        { new: true });
    }
    else {
      actionType = "Add";
      req.body.created_by = req.user.id;
      req.body.updated_by = req.user.id;

      //check file uploaded
      // req.body.file_history = fileHistoryPayload(req);

      productDesign = await CriteriaUploadModel
        .create(req.body)
    }

    if (req.body.new_file) {
      const fileHistory = await FileHistoryModel.create({
        file_url: req.body.new_file.file_url,
        file_name: req.body.new_file.file_name,
        loaded_by: req.user.id,
        link_id: productDesign._id
      });
      console.log('FileHistory', fileHistory)
    }

    const changeTracking = new ChangeTracking({
      client: productDesign._id,
      update: productDesign,
      model: "ProductDesign",
      updateType: actionType,
      updatedObject: req.body.id,
      updatedBy: req.user.id
    });
    await changeTracking.save();

    productDesign = await CriteriaUploadModel.findById(productDesign._id)
      .populate('file_history.loaded_by')
      .populate('file_history.cleared_by');

    res.json(mapProductDesign(productDesign))
  }
  catch (error) {
    console.log('upsert', error)
    res.status(500).send(error)
  };
}

exports.getLatest = async (req, res) => {
  try {

    let productDesigns = await CriteriaUploadModel.findById('611e82e4de777c1c549ab347');
    console.log("GETLATEST1",productDesigns);
    if (!productDesigns) {
      productDesigns = await CriteriaUploadModel.findById('61596b861ea6bf29a42cee0f');
    }
    console.log("GETLATEST2",productDesigns);
    res.json(mapProductDesign(productDesigns));

  }
  catch (error) {
    console.log('get', error)
    res.status(500).send(error)
  };
}
