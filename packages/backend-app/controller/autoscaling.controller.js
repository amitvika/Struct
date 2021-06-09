const AutoscalingModel = require("../models/autoscaling.modal");
const ChangeTracking = require("../models/ChangeTracking.model");
const { getObjectId } = require('../utils/helper')
const { mapAutoscaling, mapAutoscalings, mapAutoscalingsForItem } = require('../map/autoscaling');

exports.get = async (req, res) => {
    try {

        const query = buildQuery(req)

        let autoscalings = [];

        if (query.$and.length > 0) {
            autoscalings = await AutoscalingModel
                .find(query)
                .populate('approval_list.author')
                .sort({ updatedAt: -1 })

        }
        else {
            autoscalings = await AutoscalingModel
                .find()
                .populate('approval_list.author')
                .sort({ updatedAt: -1 })

        }

        res.json(mapAutoscalings(autoscalings));

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

    if (req.query.factory_id) {
        query.$and.push({ factory_id: getObjectId(req.query.factory_id) });
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
        let autoscaling = await AutoscalingModel.findById(req.body.id);

        if (autoscaling) {
            actionType = "Update";
            req.body.created_by = autoscaling.created_by;
            req.body.updated_by = req.user.id;
            req.body.productionApprovedBy = undefined;

            let data = req.body;

            autoscaling = await AutoscalingModel.findByIdAndUpdate(
                req.body.id,
                { $set: data },
                { new: true });
        }
        else {
            actionType = "Add";
            req.body.created_by = req.user.id;

            autoscaling = await AutoscalingModel.create(req.body);
        }

        const changeTracking = new ChangeTracking({
            client: req.body.id,
            update: autoscaling,
            model: "Autoscaling",
            updateType: actionType,
            updatedObject: req.body.id,
            updatedBy: req.user.id
        });
        await changeTracking.save();

        autoscaling = await AutoscalingModel.findById(autoscaling._id).populate('productionApprovedBy')

        res.json(mapAutoscaling(autoscaling))
    }
    catch (error) {
        console.log('upsert', error)
        res.status(500).send(error)
    };
}



exports.approveItemForAutoscaling = async (req, res) => {
    try {

        let autoscaling = await AutoscalingModel.findById(req.params.id)
        let isApprovedforProduction = false;

        if (autoscaling && autoscaling.approval_list) {
            isApprovedforProduction = autoscaling.approval_list.length == 2 ? true : false;
        }

        autoscaling = await AutoscalingModel.findByIdAndUpdate(
            req.params.id,
            {
                $push: { "approval_list": { author: req.user.id, is_approved: true } },
                $set: { isApprovedforProduction: isApprovedforProduction }
            },
            { new: true })

        const changeTracking = new ChangeTracking({
            client: req.body.id,
            update: autoscaling,
            model: "Autoscaling",
            updateType: 'Approve Item for production',
            updatedObject: req.body.id,
            updatedBy: req.user.id
        });
        await changeTracking.save();

        autoscaling = await AutoscalingModel.findById(autoscaling._id)
            .populate('approval_list.author');

        res.json(mapAutoscaling(autoscaling))
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

        let autoscalings = [];

        autoscalings = await AutoscalingModel
            .find(query)
            .populate('item_id')
            .sort({ updatedAt: -1 })

        res.json(mapAutoscalingsForItem(autoscalings));

    }
    catch (error) {
        console.log('get', error)
        res.status(500).send(error)
    };
}