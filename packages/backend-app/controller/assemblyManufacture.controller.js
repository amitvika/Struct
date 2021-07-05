const AssemblyManufactureModel = require("../models/AssemblyManufacture.model");
const ChangeTracking = require("../models/ChangeTracking.model");

exports.getByItem = async (req, res) => {
    try {

        const assemblyManufacture = await AssemblyManufactureModel
            .findOne({ itemId: req.params.itemId })
            .populate("processConfiguration.assemblySequences.itemId")
        res.json(assemblyManufacture)
    }
    catch (error) {
        console.log('====', error)
        res.status(500).send(error)
    };
}

exports.upsert = async (req, res) => {
    try {

        const upertedAssemblyManufacture = await AssemblyManufactureModel.updateOne(
            { itemId: req.body.itemId },
            req.body,
            { upsert: true, new: true });


        const changeTracking = new ChangeTracking({
            client: req.body.itemId,
            update: upertedAssemblyManufacture,
            model: "AssemblyManufacture",
            updateType: "Upsert",
            updatedObject: req.body.itemId,
            updatedBy: req.user.id
        });
        await changeTracking.save();

        const assemblyManufacture = await AssemblyManufactureModel
            .findOne({ itemId: req.body.itemId })
            .populate("processConfiguration.assemblySequences.itemId");

        res.json(assemblyManufacture)
    }
    catch (error) {
        console.log('====', error)
        res.status(500).send(error)
    };
}