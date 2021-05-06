const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

//Define the User model schema(filed structure)
const ItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    vendorId: {
        type: Schema.Types.ObjectId,
        ref: "Vendor"
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: {
        type: Date
    },
    selectedClientId: {
        type: Schema.Types.ObjectId,
        ref: "Client",
    },
    assemblyType: { type: String },
    itemGeometry: { type: Object },
    itemTypeConfiguration: { type: Object },
    vendorDetails: { type: Object },
    compliance: {
        RoHS: { type: Boolean, default: false },
        ISO: { type: Boolean, default: false },
        CE: { type: Boolean, default: false },
        FCC: { type: Boolean, default: false },
    },
    dispensing: {
        SPOOLBASED: { type: Boolean, default: false },
        STACKED: { type: Boolean, default: false },
        GRID: { type: Boolean, default: false },
        GRIDSTACKED: { type: Boolean, default: false },
        BULKCONTAINER: { type: Boolean, default: false },
        LIQUIDVAT: { type: Boolean, default: false },
        PRESSUREVESSEL: { type: Boolean, default: false },
    },
    gltfjson: {
        type: Object
    },
    stl: { type: String },
    fileId: { type: Number }
}, {
    timestamps: true
});


ItemSchema.plugin(mongoosePaginate);
//this converts the schema into a model
const Item = mongoose.model("Item", ItemSchema);
//allows for exporting the schema
module.exports = Item;
