const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

//Define the User model schema(filed structure)
const VendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
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
  suppliedItems:[{ type: Schema.Types.ObjectId, ref: "Item" }],
  logoName: { type: String },
	logoUrl: { type: String }
});


VendorSchema.plugin(mongoosePaginate);
//this converts the schema into a model
const Vendor = mongoose.model("Vendor", VendorSchema);
//allows for exporting the schema
module.exports = Vendor;
