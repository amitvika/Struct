const DocumentationModel = require("../models/documentation.model");
const ChangeTracking = require("../models/ChangeTracking.model");
const { getObjectId } = require('../utils/helper')

exports.get = async (req, res) => {
    try {

        const query = buildQuery(req)

        let documentations = [];

        if (query.$and.length > 0) {
            documentations = await DocumentationModel.find(query)
                .populate("created_by",)
                .populate("updated_by")
                .sort({ updatedAt: -1 })
        }
        else {
            documentations = await DocumentationModel
                .find()
                .populate("created_by",)
                .populate("updated_by")
                .sort({ updatedAt: -1 })
        }

        res.json(documentations);

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

    if (req.query.client_id) {
        query.$and.push({ client_id: getObjectId(req.query.client_id) })
    }

    if (req.query.search) {
        query.$and.push({ name: { '$regex': new RegExp(`${req.query.search}`, "i") } })
    }

    if (req.query.category) {
        query.$and.push({ category: { '$regex': new RegExp(`${req.query.category}`, "i") } })
    }

    // query.push({ $sort: { date: -1 } })
    return query
}

exports.upsert = async (req, res) => {
    try {

        let documentation = await DocumentationModel.findById(req.body.id);

        if (documentation) {
            req.body.created_by = documentation.created_by;
            req.body.updated_by = req.user.id;
            documentation = await DocumentationModel.findByIdAndUpdate(
                req.body.id,
                { $set: req.body },
                { new: true });
        }
        else {
            req.body.created_by = req.user.id;
            documentation = await DocumentationModel.create(req.body);
        }

        const changeTracking = new ChangeTracking({
            client: req.body.id,
            update: documentation,
            model: "Documentation",
            updateType: "Upsert",
            updatedObject: req.body.id,
            updatedBy: req.user.id
        });
        await changeTracking.save();

        res.json(documentation)
    }
    catch (error) {
        console.log('upsert', error)
        res.status(500).send(error)
    };
}