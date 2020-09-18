const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;
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

ProcessGroupSchema.plugin(mongoosePaginate);
//this converts the schema into a model
const ProcessGroup = mongoose.model("ProcessGroup", ProcessGroupSchema);
//allows for exporting the schema
module.exports = ProcessGroup;
