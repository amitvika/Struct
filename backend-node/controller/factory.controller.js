const FactoryModel = require("../models/factory.model");
const ChangeTracking = require("../models/ChangeTracking.model");
var mongoose = require('mongoose');

exports.get = async (req, res) => {

    try {
        let query = { $and: [] };
        query.$and.push({
            "deletedAt": { "$exists": false }
        })

        if (req.params.factories) {
            query.$and.push({
                "_id": { $in: req.params.factories }
            })
        }

        const factories = await FactoryModel.find(query)
            .populate("author", "name")
            .sort({ date: -1 }) //sorts descending

        res.json(factories)

    } catch (error) {
        return res
            .status(500)
            .send({ message: 'Some unexpected error occurred' })
    }
}

exports.upsert = async (req, res) => {
    try {

        let factory;
        if (req.body.id) {
            factory = await FactoryModel.updateOne(
                { _id: req.body.id },
                req.body,
                { upsert: true, new: true });
        }
        else {
            const factoryModel = FactoryModel(req.body)
            factory = await factoryModel.save()
        }

        if (!factory) {
            throw { message: 'Unable to save Factory' }
        }

        factory = await FactoryModel
            .findById(factory._id)
            .populate("author", "name")

        const changeTracking = new ChangeTracking({
            client: factory._id,
            update: factory,
            model: "Factory",
            updateType: "Upsert",
            updatedObject: factory._id,
            updatedBy: req.user.id
        });

        await changeTracking.save();

        res.json(factory);
    } catch (error) {
        console.log(error)

        return res
            .status(500)
            .send({ message: error.message })
    }
}