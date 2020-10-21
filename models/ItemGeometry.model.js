const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ItemGeomterySchema = new mongoose.Schema({
  itemId : {
    type: Schema.Types.ObjectId,
    ref: "Item"
  },
  step: {
    type: Object
  }
});
//this converts the schema into a model
const ItemGeomtery = mongoose.model("ItemGeomtery", ItemGeomterySchema);
//allows for exporting the schema
module.exports = ItemGeomtery;
