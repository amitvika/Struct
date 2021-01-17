const mongoose = require("mongoose");
var Schema = mongoose.Schema;
//Define the User model schema(filed structure)
const ProcessDataSchema = new mongoose.Schema({
  process: {
    type: Schema.Types.ObjectId,
    ref: "Process",
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  deletedAt: {
    type: Date
  },
  processGroup: {
    type: Schema.Types.ObjectId,
    ref: "ProcessGroup",
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  configuration: {
    type: Object
  },
  itemId: {
    type: Schema.Types.ObjectId,
    ref: "Item"
  },
  assemblySequences: [{
    orderNumber: { type: Number },
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "Item"
    },
    fasteningMethods: [{ type: Object }]
  }]
});
//this converts the schema into a model
const ProcessData = mongoose.model("ProcessData", ProcessDataSchema);
//allows for exporting the schema
module.exports = ProcessData;
