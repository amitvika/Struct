const ProductDesignModel = require("../models/productDesign.modal");
const ChangeTracking = require("../models/ChangeTracking.model");
const { getObjectId } = require('../utils/helper')
const { mapProductDesign, mapProductDesigns, mapProductDesignsForItem } = require('../map/productDesign');

exports.get = async (req, res) => {
    try {

        const query = buildQuery(req)

        let productDesigns = [];

        if (query.$and.length > 0) {
            productDesigns = await ProductDesignModel
                .find(query)
                .populate('created_by')
                .populate('updated_by')
                .sort({ updatedAt: -1 })

        }
        else {
            productDesigns = await ProductDesignModel
                .find()
                .populate('created_by')
                .populate('updated_by')
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

            let data = req.body;

            productDesign = await ProductDesignModel.findByIdAndUpdate(
                req.body.id,
                { $set: data },
                { new: true });
        }
        else {
            actionType = "Add";
            req.body.created_by = req.user.id;
            req.body.updated_by = req.user.id;

            productDesign = await ProductDesignModel.create(req.body);
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
            .populate('created_by')
            .populate('updated_by')

        res.json(mapProductDesign(productDesign))
    }
    catch (error) {
        console.log('upsert', error)
        res.status(500).send(error)
    };
}