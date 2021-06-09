const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AutoscalingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number },
    start_date: { type: Date, default: Date.now() },
    end_date: { type: Date, default: new Date('12/31/2099') },
    factory_id: { type: Schema.Types.ObjectId, ref: "Factory" },
    item_id: { type: Schema.Types.ObjectId, ref: "Item" },
    approval_list: [{
        author: { type: Schema.Types.ObjectId, ref: "User" },
        is_approved: { type: Boolean, default: false },
        time: { type: Date, default: Date.now() },
    }],
    isApprovedforProduction: { type: Boolean, default: false },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
    updated_by: { type: Schema.Types.ObjectId, ref: "User" },
    is_archived: { type: Boolean, default: false }
}, {
    timestamps: true
});

const Autoscaling = mongoose.model("Autoscaling", AutoscalingSchema);
module.exports = Autoscaling;
