const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CriteriaUploadSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String },
    category: { type: String },
    notes: { type: String },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
    updated_by: { type: Schema.Types.ObjectId, ref: "User" },
    is_archived: { type: Boolean, default: false }
}, {
    timestamps: true
});

const CriteriaUpload = mongoose.model("CriteriaUpload", CriteriaUploadSchema);
module.exports = CriteriaUpload;
