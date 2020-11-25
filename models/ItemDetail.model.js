const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ItemDetailSchema = new mongoose.Schema({
  itemId: {
    type: Schema.Types.ObjectId,
    ref: "Item",
    unique: true
  },
  itemGeometry: { type: Object },
  itemTypeConfiguration: { type: Object },
  vendorDetails : { type: Object },
  step: {
    type: Object
  },
  stl: { type: String }
});
//this converts the schema into a model
const ItemGeomtery = mongoose.model("itemDetail", ItemDetailSchema);
//allows for exporting the schema
module.exports = ItemGeomtery;
