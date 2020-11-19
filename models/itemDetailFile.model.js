const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ItemDetailFileSchema = new mongoose.Schema({
  itemId: {
    type: Schema.Types.ObjectId,
    ref: "Item",
    unique: true
  },
  step: {
    type: Object
  },
  stl: { type: String }
});
//this converts the schema into a model
const ItemGeomtery = mongoose.model("itemDetailFile", ItemDetailFileSchema);
//allows for exporting the schema
module.exports = ItemGeomtery;
