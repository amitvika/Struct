const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductDesignSchema = new mongoose.Schema({
    name: { type: String, required: true },
    design_type: { type: String },
    category: { type: String },
    notes: { type: String },
    file_history: [{
        file_url: { type: String },
        file_name: { type: String },
        loaded_by: { type: Schema.Types.ObjectId, ref: "User" },
        cleared_by: { type: Schema.Types.ObjectId, ref: "User" },
        loaded_at: { type: Date, default: Date.now },
        cleared_at: { type: Date },
    }],
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
    updated_by: { type: Schema.Types.ObjectId, ref: "User" },
    is_archived: { type: Boolean, default: false }
}, {
    timestamps: true
});

const ProductDesign = mongoose.model("ProductDesign", ProductDesignSchema);
module.exports = ProductDesign;
