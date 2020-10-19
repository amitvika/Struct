const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

//Define the User model schema(filed structure)
const AssemblyProcessSchema = new mongoose.Schema({
  assemblyId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  serialNumber: {
    type: Number,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  status:{
    type: String,
    required: true
  }
});

AssemblyProcessSchema.plugin(mongoosePaginate);
//this converts the schema into a model
const AssemblyProcess = mongoose.model("AssemblyProcess", AssemblyProcessSchema);
//allows for exporting the schema
module.exports = AssemblyProcess;
