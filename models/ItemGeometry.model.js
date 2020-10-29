const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ItemGeomterySchema = new mongoose.Schema({
  itemId: {
    type: Schema.Types.ObjectId,
    ref: "Item"
  },
  step: {
    type: Object
  },
  material: { type: String },
  shape: { type: String },
  mass: { type: String },
  volume: { type: String },
  boundingBoxX: { type: String },
  boundingBoxY: { type: String },
  boundingBoxZ: { type: String },
  numberOfFaces: { type: String },
  numberOfEdges: { type: String },
  numberOfCorners: { type: String }
});
//this converts the schema into a model
const ItemGeomtery = mongoose.model("ItemGeomtery", ItemGeomterySchema);
//allows for exporting the schema
module.exports = ItemGeomtery;
