const mongoose = require("mongoose");
var Schema = mongoose.Schema;

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
  created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
  updated_by: { type: Schema.Types.ObjectId, ref: "User" },
  archived_date: { type: Date },
  is_archived: { type: Boolean, default: false },
  access: {
    type: Object
  }
}, {
  timestamps: true
});

const UserAccessType = mongoose.model("UserAccessType", UserAccessTypeSchema);
module.exports = UserAccessType;
