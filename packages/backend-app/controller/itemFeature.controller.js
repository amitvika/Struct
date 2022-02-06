const ParserApiParsingDetailsModel = require('../models/ParserApiParsingDetails.model');
const { getObjectId, isObjectIdValid } = require('../utils/helper');

exports.getItemFeatures = async (req, res) => {
  let data;

  if (isObjectIdValid(req.body.id)) {
    data = await ParserApiParsingDetailsModel.findOne({
      _id: getObjectId(req.bod.id)
    });
  } else if (req.body.fileName) {
    data = await ParserApiParsingDetailsModel.findOne({
      filename: req.body.fileName
    });
  }

  if (data) {
    return res.send(data);
  }
  return res.status(404);
};
