const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DocumentationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String },
    note: { type: String },
    file_url: { type: String },
    client_id: { type: Schema.Types.ObjectId, ref: "Client" },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updated_by: { type: Schema.Types.ObjectId, ref: "User" },
    deleted_at: { type: Date },
    is_archived: { type: Boolean, default: false }
}, {
    timestamps: true
});

const Documentation = mongoose.model("Documentation", DocumentationSchema);
module.exports = Documentation;
