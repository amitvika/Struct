const mongoose = require("mongoose");
var Schema = mongoose.Schema;
//Define the User model schema(filed structure)
const UserSchema = new mongoose.Schema({
  /*_id: {
    type: Schema.Types.ObjectId
  },*/
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  userAccess: {
    type: Schema.Types.ObjectId,
    ref: "UserAccessType"
  }
});
//this converts the schema into a model
const User = mongoose.model("User", UserSchema);
//allows for exporting the schema
module.exports = User;
