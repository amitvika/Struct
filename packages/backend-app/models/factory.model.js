const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FactorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    selectedItemId: { type: Schema.Types.ObjectId, ref: "Item" },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
    updated_by: { type: Schema.Types.ObjectId, ref: "User" },
    is_archived: { type: Boolean, default: false }
}, {
    timestamps: true
});

const Factory = mongoose.model("Factory", FactorySchema);
module.exports = Factory;
