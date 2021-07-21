const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FileHistorySchema = new mongoose.Schema({
    link_id: { type: Schema.Types.ObjectId },
    file_url: { type: String },
    file_name: { type: String },
    loaded_by: { type: Schema.Types.ObjectId, ref: "User" },
    cleared_by: { type: Schema.Types.ObjectId, ref: "User" },
    loaded_at: { type: Date, default: Date.now },
    cleared_at: { type: Date },
}, {
    timestamps: true
});

const FileHistory = mongoose.model("FileHistory", FileHistorySchema);
module.exports = FileHistory;
