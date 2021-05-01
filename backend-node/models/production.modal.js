const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number },
    start_date: { type: Date, default: Date.now() },
    end_date: { type: Date, default: new Date('12/31/2099') },
    factory_id: { type: Schema.Types.ObjectId, ref: "Factory" },
    item_id: { type: Schema.Types.ObjectId, ref: "Item" },
    isApprovedforProduction: { type: Boolean, default: false },
    productionApprovedBy: { type: Schema.Types.ObjectId, ref: "User" },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
    updated_by: { type: Schema.Types.ObjectId, ref: "User" },
    is_archived: { type: Boolean, default: false }
}, {
    timestamps: true
});

const Production = mongoose.model("Production", ProductionSchema);
module.exports = Production;
