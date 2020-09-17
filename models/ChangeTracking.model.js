const mongoose = require("mongoose");
var Schema = mongoose.Schema;
//Define the User model schema(filed structure)
const ChangeTrackingSchema = new mongoose.Schema({
  client: {
    type: Schema.Types.ObjectId,
    ref: "Client",
    required: true
  },
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
  },
  updatedObject: {
    type: Schema.Types.ObjectId,
    required: true
  }
});
//this converts the schema into a model
const ChangeTracking = mongoose.model("ChangeTracking", ChangeTrackingSchema);
//allows for exporting the schema
module.exports = ChangeTracking;
