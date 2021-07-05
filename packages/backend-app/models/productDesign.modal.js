const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductDesignSchema = new mongoose.Schema({
    name: { type: String, required: true },
    design_type: { type: String },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
    updated_by: { type: Schema.Types.ObjectId, ref: "User" },
    is_archived: { type: Boolean, default: false }
}, {
    timestamps: true
});

const ProductDesign = mongoose.model("ProductDesign", ProductDesignSchema);
module.exports = ProductDesign;
