const mongoose = require("mongoose");
var Schema = mongoose.Schema;
//Define the User model schema(filed structure)
const UserAccessTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  deletedAt: {
    type: Date
  },
  access: {
    type: Object
  }
});
//this converts the schema into a model
const UserAccessType = mongoose.model("UserAccessType", UserAccessTypeSchema);
//allows for exporting the schema
module.exports = UserAccessType;
