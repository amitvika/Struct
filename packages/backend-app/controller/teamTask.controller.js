const TeamTaskModel = require("../models/teamTask.modal");
const TeamModel = require("../models/team.modal");
const ChangeTracking = require("../models/ChangeTracking.model");
const { getObjectId } = require('../utils/helper')
const UserModel = require("../models/User");
const { mapTeamTask, mapTeamTasks, mapMyTeamTasks } = require('../map/teamTask');


exports.get = async (req, res) => {
	try {

		const query = buildQuery(req)

		let teams = [];

		if (query.$and.length > 0) {
			teams = await TeamTaskModel.find(query)
				.populate('assigned_teams')
				.sort({ updatedAt: -1 })

		}
		else {
			teams = await TeamTaskModel
				.find()
				.populate('assigned_teams')
				.sort({ updatedAt: -1 })

		}

		res.json(mapTeamTasks(teams));

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

	if (req.query.teamId) {
		query.$and.push({ teamId: getObjectId(req.query.teamId) });
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

		let team = await TeamTaskModel.findById(req.body.id);

		if (team) {
			req.body.created_by = team.created_by;
			req.body.updated_by = req.user.id;
			team = await TeamTaskModel.findByIdAndUpdate(
				req.body.id,
				{ $set: req.body },
				{ new: true });
		}
		else {
			req.body.created_by = req.user.id;

			team = await TeamTaskModel.create(req.body);
		}

		const changeTracking = new ChangeTracking({
			client: req.body.id,
			update: team,
			model: "TeamTask",
			updateType: "Upsert",
			updatedObject: req.body.id,
			updatedBy: req.user.id
		});
		await changeTracking.save();

		team = await TeamTaskModel.findById(req.body.id).populate('assigned_teams');
		res.json(mapTeamTask(team))
	}
	catch (error) {
		console.log('upsert', error)
		res.status(500).send(error)
	};
}