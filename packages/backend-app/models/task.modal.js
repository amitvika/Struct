const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TaskSchema = new mongoose.Schema({
    name: { type: String, required: true },
    assigned_team: { type: Schema.Types.ObjectId, ref: "Team" },
    team_task: { type: Schema.Types.ObjectId, ref: "TeamTask" },
    assigned_to: { type: Schema.Types.ObjectId, ref: "User" },
    created_team: { type: Schema.Types.ObjectId, ref: "Team" },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updated_by: { type: Schema.Types.ObjectId, ref: "User" },
    deleted_at: { type: Date },
    is_archived: { type: Boolean, default: false }
}, {
    timestamps: true
});

const Team = mongoose.model("Task", TaskSchema);
module.exports = Team;
