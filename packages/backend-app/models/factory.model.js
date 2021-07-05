const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FactorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    selectedItemId: { type: Schema.Types.ObjectId, ref: "Item" },
    date: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
    author: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
}, {
    timestamps: true
});

const Factory = mongoose.model("Factory", FactorySchema);
module.exports = Factory;
