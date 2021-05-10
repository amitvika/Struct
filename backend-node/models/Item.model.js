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
        spoolBased: { type: Boolean, default: false },
        stacked: { type: Boolean, default: false },
        grid: { type: Boolean, default: false },
        gridStacked: { type: Boolean, default: false },
        bulkContainer: { type: Boolean, default: false },
        liquidVat: { type: Boolean, default: false },
        pressure: { type: Boolean, default: false },
    },
    fullProcess: {
        spoolBased: { type: Boolean, default: false },
        stacked: { type: Boolean, default: false },
        grid: { type: Boolean, default: false },
        gridStacked: { type: Boolean, default: false },
        bulkContainer: { type: Boolean, default: false },
        liquidVat: { type: Boolean, default: false },
        pressure: { type: Boolean, default: false },
    },
    storage: {
        spoolBased: { type: Boolean, default: false },
        stacked: { type: Boolean, default: false },
        grid: { type: Boolean, default: false },
        gridStacked: { type: Boolean, default: false },
        bulkContainer: { type: Boolean, default: false },
        liquidVat: { type: Boolean, default: false },
        pressure: { type: Boolean, default: false },
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
