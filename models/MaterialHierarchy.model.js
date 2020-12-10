const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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

const MaterialHierarchy = mongoose.model("MaterialHierarchy", MaterialHierarchySchema);
//allows for exporting the schema
module.exports = MaterialHierarchy;
