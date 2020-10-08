const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

//Define the User model schema(filed structure)
const ItemDetailSchema = new mongoose.Schema({
  material: { type: String },
  shape: { type: Object },
  mass: { type: Object },
  volume: { type: Object },
  boundingBoxX: { type: Object },
  boundingBoxY: { type: Object },
  boundingBoxZ: { type: Object },
  stepFileId: { type: Object },
  numberOfFaces: { type: Object },
  numberOfEdges: { type: Object },
  numberOfCorners: { type: Object }
});


ItemDetailSchema.plugin(mongoosePaginate);
//this converts the schema into a model
const Item = mongoose.model("ItemDetail", ItemDetailSchema);
//allows for exporting the schema
module.exports = Item;
