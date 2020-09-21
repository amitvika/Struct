const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

//Define the User model schema(filed structure)
const VendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});


VendorSchema.plugin(mongoosePaginate);
//this converts the schema into a model
const Vendor = mongoose.model("Vendor", VendorSchema);
//allows for exporting the schema
module.exports = Vendor;
