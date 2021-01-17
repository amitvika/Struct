const mongoose = require("mongoose");
var Schema = mongoose.Schema;
//Define the User model schema(filed structure)
const ClientSchema = new mongoose.Schema({
	name: { type: String, required: true },
	date: { type: Date, default: Date.now },
	createdByUserId: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	deletedAt: { type: Date },
	websiteName: { type: String },
	isSiteVisible: { type: String },
	isDeleted: { type: Boolean, default: false },
});
//this converts the schema into a model
const Client = mongoose.model("Client", ClientSchema);
//allows for exporting the schema
module.exports = Client;
