const FactoryModel = require("../models/factory.model");
const ChangeTracking = require("../models/ChangeTracking.model");
var mongoose = require('mongoose');
const { getObjectId } = require('../utils/helper')

exports.get = async (req, res) => {

    try {
        let query = { $and: [] };
        query.$and.push({
            "deletedAt": { "$exists": false }
        })

        if (req.query.factory_id) {
            query.$and.push({
                "_id": getObjectId(req.query.factory_id)
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
        let id = req.body.id || req.body._id
        if (id) {
            factory = await FactoryModel.updateOne(
                { _id: id },
                req.body,
                { upsert: true, new: true });
        }
        else {
            const factoryModel = new FactoryModel({
                name: req.body.name,
                author: req.user.id
            })
            factory = await factoryModel.save();

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