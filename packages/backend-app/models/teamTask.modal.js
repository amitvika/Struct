const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TeamTaskSchema = new mongoose.Schema({
    name: { type: String },
    description: { type: String },
    teamId: { type: Schema.Types.ObjectId, ref: "Team" },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updated_by: { type: Schema.Types.ObjectId, ref: "User" },
    archived_date: { type: Date },
    is_archived: { type: Boolean, default: false }
}, {
    timestamps: true
});

const TeamTask = mongoose.model("TeamTask", TeamTaskSchema);
module.exports = TeamTask;
