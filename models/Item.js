const mongoose = require("mongoose");
//Define the User model schema(filed structure)
const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});
//this converts the schema into a model
const Item = mongoose.model("Item", ItemSchema);
//allows for exporting the schema
module.exports = Item;
