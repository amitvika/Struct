const AccessSetup = require("../models/UserAccessType");
const ChangeTracking = require("../models/ChangeTracking.model");
const TeamModel = require("../models/team.modal");

const { getObjectId } = require('../utils/helper');
const { mapAccessSetup, mapAccessSetups } = require('../map/accessSetup');

exports.get = async (req, res) => {
	try {

		const query = buildQuery(req)

		let teams = [];

		if (query.$and.length > 0) {
			teams = await AccessSetup.find(query)
				.populate('created_by')
				.sort({ updatedAt: -1 })

		}
		else {
			teams = await AccessSetup
				.find()
				.populate('created_by')
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

		team = await AccessSetup.findById(req.body.id)
			.populate('created_by')

		res.json(mapAccessSetup(team))
	}
	catch (error) {
		console.log('upsert', error)
		res.status(500).send(error)
	};
}


exports.getMyAccess = async (req, res) => {
	try {

		let query = { $and: [] };
		query.$and.push({
			"accessId": { "$exists": true }
		});
		query.$and.push({
			"members": getObjectId(req.user.id)
		});

		let teams = await TeamModel.find(query)
			.populate('accessId');

		res.json(mergeAndFilterAccess(teams))

	}
	catch (error) {
		console.log('getMyAccess', error)
		res.status(500).send(error)
	};
}


const mergeAndFilterAccess = (teams) => {

	return teams
		.map(team => {
			let access = team.accessId.access;

			const filtered = Object.keys(access)
				.filter(key => access[key] === true)
				.reduce((obj, key) => {
					obj[key] = access[key];
					return obj;
				}, {});
			return filtered
		})
		.reduce((result, current) => {
			return Object.assign(result, current);
		}, {});
}