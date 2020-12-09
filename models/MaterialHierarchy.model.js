const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
  }
});