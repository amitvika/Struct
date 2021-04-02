const AccessSetup = require("../models/UserAccessType");
const ChangeTracking = require("../models/ChangeTracking.model");
const { getObjectId } = require('../utils/helper')

const { mapAccessSetup, mapAccessSetups } = require('../map/accessSetup')

exports.get = async (req, res) => {
	try {

		const query = buildQuery(req)

		let teams = [];

		if (query.$and.length > 0) {
			teams = await AccessSetup.find(query)
				.sort({ updatedAt: -1 })

		}
		else {
			teams = await AccessSetup
				.find()
				.sort({ updatedAt: -1 })

		}

		res.json(mapAccessSetups(teams));

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

	if (req.query.name) {
		query.$and.push({ name: { '$regex': new RegExp(`${req.query.name}`, "i") } })
	}

	return query
}

exports.upsert = async (req, res) => {
	try {

		let team = await AccessSetup.findById(req.body.id);

		if (team) {
			req.body.created_by = team.created_by;
			req.body.updated_by = req.user.id;
			team = await AccessSetup.findByIdAndUpdate(
				req.body.id,
				{ $set: req.body },
				{ new: true });
		}
		else {
			req.body.created_by = req.user.id;
			team = await AccessSetup.create(req.body);
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

		res.json(mapAccessSetup(team))
	}
	catch (error) {
		console.log('upsert', error)
		res.status(500).send(error)
	};
}
