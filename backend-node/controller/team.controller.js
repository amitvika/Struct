const TeamModel = require("../models/team.modal");
const ChangeTracking = require("../models/ChangeTracking.model");
const { getObjectId } = require('../utils/helper')
const UserModel = require("../models/User");
const { mapTeam, mapTeams } = require('../map/team');
const { mapUser, mapUsers } = require('../map/user')

exports.get = async (req, res) => {
	try {

		const query = buildQuery(req)

		let teams = [];

		if (query.$and.length > 0) {
			teams = await TeamModel.find(query)
				// .populate("members")
				.populate("created_by")
				.populate("updated_by")
				.sort({ updatedAt: -1 })

		}
		else {
			teams = await TeamModel
				.find()
				// .populate("members")
				.populate("created_by",)
				.populate("updated_by")
				.sort({ updatedAt: -1 })

		}

		res.json(mapTeams(teams));

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

	if (req.query.name) {
		query.$and.push({ name: { '$regex': new RegExp(`${req.query.name}`, "i") } })
	}

	// query.push({ $sort: { date: -1 } })
	return query
}

exports.upsert = async (req, res) => {
	try {

		let team = await TeamModel.findById(req.body.id);

		if (team) {
			req.body.created_by = team.created_by;
			req.body.updated_by = req.user.id;
			team = await TeamModel.findByIdAndUpdate(
				req.body.id,
				{ $set: req.body },
				{ new: true });
		}
		else {
			req.body.created_by = req.user.id;
			team = await TeamModel.create(req.body);
		}

		const changeTracking = new ChangeTracking({
			client: req.body.id,
			update: team,
			model: "Team",
			updateType: "Upsert",
			updatedObject: req.body.id,
			updatedBy: req.user.id
		});
		await changeTracking.save();

		res.json(mapTeam(team))
	}
	catch (error) {
		console.log('upsert', error)
		res.status(500).send(error)
	};
}

exports.getUsers = async (req, res) => {

	try {
		const users = await UserModel
			.find()
			.sort({ date: -1 })

		res.json(mapUsers(users));

	} catch (error) {
		console.log(error)
		res.status(500).send(error)
	}
}