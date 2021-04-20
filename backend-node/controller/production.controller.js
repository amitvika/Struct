const ProductionModel = require("../models/production.modal");
const ChangeTracking = require("../models/ChangeTracking.model");
const { getObjectId } = require('../utils/helper')
const UserModel = require("../models/User");
const { mapProduction, mapProductions } = require('../map/production');

exports.get = async (req, res) => {
	try {

		const query = buildQuery(req)

		let productions = [];

		if (query.$and.length > 0) {
			productions = await ProductionModel
				.find(query)
				.sort({ updatedAt: -1 })

		}
		else {
			productions = await ProductionModel
				.find()
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

	if (req.user.id) {
		query.$and.push({ created_by: getObjectId(req.user.id) });
	}

	if (req.query.name) {
		query.$and.push({ name: { '$regex': new RegExp(`${req.query.name}`, "i") } })
	}

	return query
}

exports.upsert = async (req, res) => {
	try {
		let actionType;
		let task = await ProductionModel.findById(req.body.id);

		if (task) {
			actionType = "Update";
			req.body.created_by = task.created_by;
			req.body.updated_by = req.user.id;
			task = await ProductionModel.findByIdAndUpdate(
				req.body.id,
				{ $set: req.body },
				{ new: true });
		}
		else {
			actionType = "Add";
			req.body.created_by = req.user.id;

			task = await ProductionModel.create(req.body);
		}

		const changeTracking = new ChangeTracking({
			client: req.body.id,
			update: task,
			model: "Production",
			updateType: actionType,
			updatedObject: req.body.id,
			updatedBy: req.user.id
		});
		await changeTracking.save();

		task = await ProductionModel.findById(req.body.id)

		res.json(mapProduction(task))
	}
	catch (error) {
		console.log('upsert', error)
		res.status(500).send(error)
	};
}


