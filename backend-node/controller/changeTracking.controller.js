const ChangeTracking = require("../models/ChangeTracking.model");

exports.get = async (req, res) => {
  try {
    const userId = req.user.id;
    const pageName = req.query.pageName;
    const updatedId = req.query.updatedId;

    let query = {};
    if (pageName) {
      query = { $and: [] };
      query.$and.push({ model: pageName });
    }

    if (updatedId && updatedId !== 'undefined') {
      query.$and.push({ updatedObject: updatedId });
    }

    const options = {
      page: req.query.page,
      limit: req.query.limit,
      populate: ['updatedBy', 'client'],
      sort: { date: -1 },
    };

    const trackingHistory = await ChangeTracking.paginate(query, options)

    res.json(trackingHistory);

  }
  catch (error) {
    console.log('====', error)
    res.status(500).send(error)
  };
}

exports.getByUpdatedByObjectId = async (req, res) => {
  try {
    const updatedId = req.params.id;
    let query = { updatedObject: updatedId };

    const options = {
      page: req.query.page,
      limit: req.query.limit,
      populate: ['updatedBy', 'client'],
      sort: { date: -1 },
    };

    const trackingHistory = await ChangeTracking.paginate(query, options)

    res.json(trackingHistory);

  }
  catch (error) {
    console.log('====', error)
    res.status(500).send(error)
  };
}