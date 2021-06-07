const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

//Define the User model schema(filed structure)
const AssemblyManufactureSchema = new mongoose.Schema({
  processConfiguration: {
    assemblySequences: [{
      orderNumber: { type: Number },
      itemId: {
        type: Schema.Types.ObjectId,
        ref: "Item"
      },
      fasteningMethods: [{ type: Object }]
    }]
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  itemId: {
    type: Schema.Types.ObjectId,
  },
});

AssemblyManufactureSchema.plugin(mongoosePaginate);
//this converts the schema into a model
const AssemblyManufacture = mongoose.model("AssemblyManufacture", AssemblyManufactureSchema);
//allows for exporting the schema
module.exports = AssemblyManufacture;
