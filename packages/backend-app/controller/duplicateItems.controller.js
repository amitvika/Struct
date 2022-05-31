const ItemModel = require('../models/Item.model');
const { getObjectId } = require('../utils/helper');
const { mapDuplicateItems } = require('../map/duplicateItems.map');
const { mapItems } = require('../map/item.map');

exports.get = async (req, res) => {
    try {
        let query = buildQuery1(req);
        let duplicateItems = []; let fileName = "";

        if (query.$and.length > 0) {
            duplicateItems = await ItemModel.aggregate([
                { $match: query },
                { $project: { _id: 1, fileName: 1, duplicatedetail: "$comparison_parameters.matched" } }
            ]);
            if (duplicateItems && duplicateItems.length) {
                fileName = duplicateItems && duplicateItems.length && duplicateItems[0].fileName;
                duplicateItems = duplicateItems && duplicateItems.length && duplicateItems[0].duplicatedetail;
            } else {
                query = buildQuery2(req);
                if (query.$and.length > 0) {
                    duplicateItems = await ItemModel.aggregate([
                        { $match: query },
                        { $lookup: { from: 'parserapi_parsingdetails', let: { fileName: '$fileName' }, pipeline: [{ $match: { $expr: { $and: [{ $eq: ['$filename', '$$fileName'] }, { $eq: ['$comparepercent', 100] }] } } }, { $project: { _id: 1, name: 1, matched_across: 1, assembly: 1 } }], as: 'duplicatedetail' } },
                        { $project: { _id: 1, fileName: 1, duplicatedetail: { $arrayElemAt: ["$duplicatedetail", 0] } } }
                    ]);
                    fileName = duplicateItems && duplicateItems.length && duplicateItems[0].fileName;
                    duplicateItems = duplicateItems && duplicateItems.length && duplicateItems[0].duplicatedetail && duplicateItems[0].duplicatedetail.matched_across;
                }
            }
            let mapitems = mapDuplicateItems(duplicateItems);
            duplicateItems = await ItemModel.find({ $and: [{ parent_id: { $ne: getObjectId(req.query.id) } }, { fileName: { '$ne': fileName } }, { fileName: { '$in': mapitems } }] })
        }
        duplicateItems = await mapItems(duplicateItems);
        res.json(duplicateItems);
    }
    catch (error) {
        res.status(500).send(error)
    };
}

const buildQuery1 = (req) => {
    let query = { $and: [] };

    if (req.query.id) {
        query.$and.push({ _id: getObjectId(req.query.id) });
    }

    query.$and.push({ comparison_parameters: { $exists: true, $ne: null } });
    query.$and.push({ "comparison_parameters.matched": { $exists: true, $ne: [] } });

    return query
}

const buildQuery2 = (req) => {
    let query = { $and: [] };

    if (req.query.id) {
        query.$and.push({ _id: getObjectId(req.query.id) });
    }

    return query
}