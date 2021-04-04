const TaskModel = require("../models/task.modal");
const ChangeTracking = require("../models/ChangeTracking.model");
const { getObjectId } = require('../utils/helper')
const UserModel = require("../models/User");
const { mapTask, mapTasks } = require('../map/task');

exports.get = async (req, res) => {
	try {

		const query = buildQuery(req)

		let tasks = [];

		if (query.$and.length > 0) {
			tasks = await TaskModel.find(query)
				.populate('assigned_team')
				.populate('assigned_to')
				.populate('created_team')
				.populate('created_by')
				.sort({ updatedAt: -1 })

		}
		else {
			tasks = await TaskModel
				.find()
				.populate('assigned_team')
				.populate('assigned_to')
				.populate('created_team')
				.populate('created_by')
				.sort({ updatedAt: -1 })

		}

		res.json(mapTasks(tasks));

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

	if (req.query.description) {
		query.$and.push({ name: { '$regex': new RegExp(`${req.query.description}`, "i") } })
	}

	return query
}

exports.upsert = async (req, res) => {
	try {

		let task = await TaskModel.findById(req.body.id);

		if (task) {
			req.body.created_by = task.created_by;
			req.body.updated_by = req.user.id;
			task = await TaskModel.findByIdAndUpdate(
				req.body.id,
				{ $set: req.body },
				{ new: true });
		}
		else {
			req.body.created_by = req.user.id;

			task = await TaskModel.create(req.body);
		}

		const changeTracking = new ChangeTracking({
			client: req.body.id,
			update: task,
			model: "TeamTask",
			updateType: "Upsert",
			updatedObject: req.body.id,
			updatedBy: req.user.id
		});
		await changeTracking.save();

		task = await TaskModel.findById(req.body.id)
			.populate('assigned_team')
			.populate('assigned_to')
			.populate('created_team')
			.populate('created_by');

		res.json(mapTask(team))
	}
	catch (error) {
		console.log('upsert', error)
		res.status(500).send(error)
	};
}


