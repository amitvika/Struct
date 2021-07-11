const ProductDesignModel = require("../models/productDesign.modal");
const ChangeTracking = require("../models/ChangeTracking.model");
const { getObjectId } = require('../utils/helper')
const { mapProductDesign, mapProductDesigns, mapProductDesignsForItem } = require('../map/productDesign');
const _ = require('lodash');

exports.get = async (req, res) => {
    try {

        const query = buildQuery(req)

        let productDesigns = [];

        if (query.$and.length > 0) {
            productDesigns = await ProductDesignModel
                .find(query)
                .populate('file_history.loaded_by')
                .populate('file_history.cleared_by')
                .sort({ updatedAt: -1 })

        }
        else {
            productDesigns = await ProductDesignModel
                .find()
                .populate('file_history.loaded_by')
                .populate('file_history.cleared_by')
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
        let productDesign = await ProductDesignModel.findById(req.body.id);

        if (productDesign) {
            actionType = "Update";
            // req.body.created_by = productDesign.created_by;
            req.body.updated_by = req.user.id;
            // req.body.file_history = undefined;

            let data = req.body;
            // if (_.get(req, 'body.new_file.file_url') && Array.isArray(productDesign.file_history)) {

            //     productDesign = await ProductDesignModel.findByIdAndUpdate(
            //         req.body.id,
            //         { $set: data },
            //         {
            //             $push: {
            //                 file_history: {
            //                     $each: fileHistoryPayload(req, productDesign),
            //                     $position: 0
            //                 }
            //             }
            //         },
            //         { new: true });
            // }
            // else if (_.get(req, 'body.new_file.file_url')) {
            data.file_history = fileHistoryPayload(req, productDesign);
            productDesign = await ProductDesignModel.findByIdAndUpdate(
                req.body.id,
                { $set: data },
                { new: true });
            // }
            // else {
            //     productDesign = await ProductDesignModel.findByIdAndUpdate(
            //         req.body.id,
            //         { $set: data },
            //         { new: true });
            // }
        }
        else {
            actionType = "Add";
            req.body.created_by = req.user.id;
            req.body.updated_by = req.user.id;

            //check file uploaded
            req.body.file_history = fileHistoryPayload(req);

            productDesign = await ProductDesignModel
                .create(req.body)

        }

        const changeTracking = new ChangeTracking({
            client: req.body.id,
            update: productDesign,
            model: "ProductDesign",
            updateType: actionType,
            updatedObject: req.body.id,
            updatedBy: req.user.id
        });
        await changeTracking.save();

        productDesign = await ProductDesignModel.findById(productDesign._id)
            .populate('file_history.loaded_by')
            .populate('file_history.cleared_by');

        res.json(mapProductDesign(productDesign))
    }
    catch (error) {
        console.log('upsert', error)
        res.status(500).send(error)
    };
}


const fileHistoryPayload = (req, productDesign) => {
    if (productDesign && Array.isArray(productDesign.file_history) && req.body.new_file) {
        return [{
            file_url: req.body.new_file.file_url,
            file_name: req.body.new_file.file_name,
            loaded_by: req.user.id,
        }, ...productDesign.file_history]
    }
    else if (req.body.new_file) {
        return [{
            file_url: req.body.new_file.file_url,
            file_name: req.body.new_file.file_name,
            loaded_by: req.user.id,
        }];
    }
    else {
        return []
    }
}