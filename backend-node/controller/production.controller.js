const ProductionModel = require("../models/production.modal");
const ChangeTracking = require("../models/ChangeTracking.model");
const { getObjectId } = require('../utils/helper')
const UserModel = require("../models/User");
const { mapProduction, mapProductions, mapProductionsForItem } = require('../map/production');

exports.get = async (req, res) => {
    try {

        const query = buildQuery(req)

        let productions = [];

        if (query.$and.length > 0) {
            productions = await ProductionModel
                .find(query)
                .populate('productionApprovedBy')
                .sort({ updatedAt: -1 })

        }
        else {
            productions = await ProductionModel
                .find()
                .populate('productionApprovedBy')
                .sort({ updatedAt: -1 })

        }

        res.json(mapProductions(productions));

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

    if (req.query.item_id) {
        query.$and.push({ item_id: getObjectId(req.query.item_id) });
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
        let production = await ProductionModel.findById(req.body.id);

        if (production) {
            actionType = "Update";
            req.body.created_by = production.created_by;
            req.body.updated_by = req.user.id;
            req.body.productionApprovedBy = undefined;

            let data = req.body;

            production = await ProductionModel.findByIdAndUpdate(
                req.body.id,
                { $set: data },
                { new: true });
        }
        else {
            actionType = "Add";
            req.body.created_by = req.user.id;

            production = await ProductionModel.create(req.body);
        }

        const changeTracking = new ChangeTracking({
            client: req.body.id,
            update: production,
            model: "Production",
            updateType: actionType,
            updatedObject: req.body.id,
            updatedBy: req.user.id
        });
        await changeTracking.save();

        production = await ProductionModel.findById(production._id).populate('productionApprovedBy')

        res.json(mapProduction(production))
    }
    catch (error) {
        console.log('upsert', error)
        res.status(500).send(error)
    };
}



exports.approveItemForProduction = async (req, res) => {
    try {

        let production = await ProductionModel.findByIdAndUpdate(
            req.body.id,
            {
                $set: {
                    isApprovedforProduction: req.body.isApprovedforProduction,
                    productionApprovedBy: req.user.id
                }
            },
            { new: true })

        const changeTracking = new ChangeTracking({
            client: req.body.id,
            update: production,
            model: "Production",
            updateType: 'Approve Item for production',
            updatedObject: req.body.id,
            updatedBy: req.user.id
        });
        await changeTracking.save();

        production = await ProductionModel.findById(production._id).populate('productionApprovedBy');

        res.json(mapProduction(production))
    }
    catch (error) {
        console.log('upsert', error)
        res.status(500).send(error)
    };
}

exports.itemInProduction = async (req, res) => {
    try {
        const factory_id = req.query.factory_id;

        const query = { factory_id: getObjectId(factory_id), isApprovedforProduction: true }

        let productions = [];

        productions = await ProductionModel
            .find(query)
            .populate('item_id')
            .sort({ updatedAt: -1 })

        console.log(productions.length)
        res.json(mapProductionsForItem(productions));

    }
    catch (error) {
        console.log('get', error)
        res.status(500).send(error)
    };
}