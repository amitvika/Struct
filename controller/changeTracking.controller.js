const ChangeTracking = require("../models/ChangeTracking.model");

exports.get = async (req, res) => {
  try {
    const userId = req.user.id;
    const modelName = req.query.pageName;
    let query = { updatedBy: userId };
    if (modelName) {
      // query.$and.push({ model: modelName });
    }

    const options = {
      page: req.query.page,
      limit: req.query.limit,
      populate: ['updatedBy', 'client'],
      sort: { date: -1 },
    };

    const trackingHistory = await ChangeTracking.paginate({}, options)

    res.json(trackingHistory);

  }
  catch (error) {
    console.log('====', error)
    res.status(500).send(error)
  };
}