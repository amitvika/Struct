const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

//Define the User model schema(filed structure)
const VendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  suppliedItems: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
  logoName: { type: String },
  logoUrl: { type: String },
  is_archived: { type: Boolean, default: false },
  created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updated_by: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

VendorSchema.plugin(mongoosePaginate);
//this converts the schema into a model
const Vendor = mongoose.model('Vendor', VendorSchema);
//allows for exporting the schema
module.exports = Vendor;
