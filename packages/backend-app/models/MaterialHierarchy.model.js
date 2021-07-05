const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const MaterialHierarchySchema = new mongoose.Schema({
  id: { type: String, default: 0 },
  title: {
    type: String,
    required: true
  },
  parentId: {
    type: String, default: 0
  }
});

MaterialHierarchySchema.plugin(mongoosePaginate);
const MaterialHierarchy = mongoose.model("MaterialHierarchy", MaterialHierarchySchema);
//allows for exporting the schema
module.exports = MaterialHierarchy;
