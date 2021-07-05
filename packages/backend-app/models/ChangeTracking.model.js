const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

//Define the User model schema(filed structure)
const ChangeTrackingSchema = new mongoose.Schema({
  model: {
    type: String,
    required: true
  },
  update: {
    type: Object,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  updateType: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

ChangeTrackingSchema.plugin(mongoosePaginate);
//this converts the schema into a model
const ChangeTracking = mongoose.model("ChangeTracking", ChangeTrackingSchema);
//allows for exporting the schema
module.exports = ChangeTracking;
