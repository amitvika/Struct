const ChangeTracking = require("../models/ChangeTracking.model");

exports.get = async (req, res) => {
  try {
    const modelName = req.params.pageName;
    let query = {};
    if (modelName) {
      // query.$and.push({ model: modelName });
    }

    const trackingHistory = await ChangeTracking.find(query).limit(10)
      // .populate("updatedBy", "name")
      // .populate("client", "name")
      // .sort({ date: -1 })

    res.json(trackingHistory);

  }
  catch (error) {
    console.log('====', error)
    res.status(500).send(error)
  };
}