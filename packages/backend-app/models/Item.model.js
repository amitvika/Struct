const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

//Define the User model schema(filed structure)
const ItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor'
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: {
      type: Date
    },
    selectedClientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client'
    },
    assemblyType: { type: String },
    itemGeometry: { type: Object },
    itemTypeConfiguration: { type: Object },
    vendorDetails: { type: Object },
    compliance: {
      RoHS: { type: Boolean, default: false },
      ISO: { type: Boolean, default: false },
      CE: { type: Boolean, default: false },
      FCC: { type: Boolean, default: false }
    },
    fullProcess: {
      spoolBased: { type: Boolean, default: false },
      stacked: { type: Boolean, default: false },
      grid: { type: Boolean, default: false },
      gridStacked: { type: Boolean, default: false },
      bulkContainer: { type: Boolean, default: false },
      liquidVat: { type: Boolean, default: false },
      pressure: { type: Boolean, default: false }
    },
    storage: {
      spoolBased: { type: Boolean, default: false },
      stacked: { type: Boolean, default: false },
      grid: { type: Boolean, default: false },
      gridStacked: { type: Boolean, default: false },
      bulkContainer: { type: Boolean, default: false },
      liquidVat: { type: Boolean, default: false },
      pressure: { type: Boolean, default: false }
    },
    stl: { type: String },
    fileId: { type: String },
    fileUUId: { type: String },
    fileName: { type: String },
    fileStore: { type: String },
    fileGDT: { type: String },
    fileMPPS: { type: String },
    fileStack: { type: String },
    fileKinematic: { type: String },
    distanceGap: { type: Number, default: 0.1 },
    angleGap: { type: Number, default: 0.1 },
    drawLine: { type: Boolean, default: false },
    stepTreeLength: { type: Number },
    hierarchySelections: [{ type: Object }],
    classificationConfig: [{ type: Object }],
    parent_id: { type: Schema.Types.ObjectId, ref: 'Item' },
    is_child_item: { type: Boolean, default: false },
    is_child_created: { type: Boolean, default: false },
    filePartName: { type: String },
    is_archived: { type: Boolean, default: false },
    created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updated_by: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  {
    timestamps: true
  }
);

ItemSchema.statics.bulkInsertItems = function (items) {
  return this.insertMany(items);
};

ItemSchema.plugin(mongoosePaginate);
//this converts the schema into a model
const Item = mongoose.model('Item', ItemSchema);
//allows for exporting the schema
module.exports = Item;
