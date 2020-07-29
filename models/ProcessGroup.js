const mongoose = require("mongoose");
var Schema = mongoose.Schema;
//Define the User model schema(filed structure)
const ProcessGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: "Client",
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  deletedAt: {
    type: Date
  }
});
//this converts the schema into a model
const ProcessGroup = mongoose.model("ProcessGroup", ProcessGroupSchema);
//allows for exporting the schema
module.exports = ProcessGroup;
