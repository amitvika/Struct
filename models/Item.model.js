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
  assemblyType: { type: String },
  itemGeometry: { type: Object },
  itemTypeConfiguration: { type: Object },
  vendorDetails: { type: Object },
  step: {
    type: Object
  },
  stl: { type: String }
});


ItemSchema.plugin(mongoosePaginate);
//this converts the schema into a model
const Item = mongoose.model("Item", ItemSchema);
//allows for exporting the schema
module.exports = Item;
