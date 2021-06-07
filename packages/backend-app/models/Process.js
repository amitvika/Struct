const mongoose = require("mongoose");
//Define the User model schema(filed structure)
const ProcessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});
//this converts the schema into a model
const Process = mongoose.model("Process", ProcessSchema);
//allows for exporting the schema
module.exports = Process;
