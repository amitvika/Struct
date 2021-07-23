const FileHistoryModel = require("../models/fileHistory.modal");
const { mapFileHistory } = require('../map/fileHistory');
const { getObjectId } = require('../utils/helper')

exports.get = async (req, res) => {
    try {

        let fileHistory = await FileHistoryModel
            .find({ link_id: getObjectId(req.params.id) })
            .populate('loaded_by')
            .populate('cleared_by')
            .sort({ updatedAt: -1 });

        res.json(mapFileHistory(fileHistory));
    }
    catch (error) {
        console.log('get', error)
        res.status(500).send(error)
    };
}