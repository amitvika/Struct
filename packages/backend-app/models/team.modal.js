const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TeamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    accessId: { type: Schema.Types.ObjectId, ref: "UserAccessType" },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updated_by: { type: Schema.Types.ObjectId, ref: "User" },
    deleted_at: { type: Date },
    is_archived: { type: Boolean, default: false }
}, {
    timestamps: true
});

const Team = mongoose.model("Team", TeamSchema);
module.exports = Team;
