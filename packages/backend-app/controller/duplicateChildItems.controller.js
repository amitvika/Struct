const ItemModel = require('../models/Item.model');
const { getObjectId } = require('../utils/helper');
const { mapDuplicateChildItems } = require('../map/duplicateChildItems.map');
const { mapItems } = require('../map/item.map');

exports.get = async (req, res) => {
    try {
        let query = buildQuery(req);
        let duplicateChildItems = [];

        if (query.$and.length > 0) {
            duplicateChildItems = await ItemModel.aggregate([
                { $match: query },
                { $project: { _id: 1, fileName: 1, duplicatechilddetail: "$matched_childs" } }
            ]);
            let fileName = duplicateChildItems && duplicateChildItems.length && duplicateChildItems[0].fileName;
            duplicateChildItems = duplicateChildItems && duplicateChildItems.length && duplicateChildItems[0].duplicatechilddetail;
            let mapchilditems = mapDuplicateChildItems(duplicateChildItems);
            duplicateChildItems = await ItemModel.find({ $and: [{ fileName: { '$in': mapchilditems } }, { fileName: { '$ne': fileName } }] })
        }
        childItemsDetails = await mapItems(duplicateChildItems);
        res.json(childItemsDetails);
    }
    catch (error) {
        res.status(500).send(error)
    };
}

const buildQuery = (req) => {
    let query = { $and: [] };
    if (req.query.id) {
        query.$and.push({ _id: getObjectId(req.query.id) });
    }
    query.$and.push({ matched_childs: { $exists: true, $type: 'array', $ne: [] } });
    return query
}