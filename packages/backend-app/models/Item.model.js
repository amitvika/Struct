const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const ItemMotionControlSchema = new mongoose.Schema(
  {
    item_id: { type: Schema.Types.ObjectId, ref: 'Item' },
    axis_number: { type: Number, default: 0 },
    chain_number: { type: Number, default: 0 },
    child_chain_number: { type: Number, default: 0 },
    child_sequence_number: [{ type: Number, default: 0 }],
    child_part_name: { type: String },
    child_part_display_name: { type: String },
    child_part_type: {
      type: String,
      enum: ['ACTUATOR', 'LINKAGE', 'STATIC'],
      default: 'STATIC'
    },
    is_linear_or_rotational: { type: Boolean, default: false },
    cylindrical_axis_of_rotation: { type: Object },
    rotational_angle_limit: { type: Number, default: 0 },
    linear_distance_limit: { type: Number, default: 0 },
    is_end_effector: { type: Boolean, default: false },
    machine_actuator_limit: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

const ItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    item_type: {
      type: String,
      default: 'CAD'
    },
    design_type: {
      type: String
    },
    date: {
      type: Date,
      default: Date.now
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor'
    },
    selectedClientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client'
    },
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
    child_item_status: {
      type: String,
      enum: ['INITIATED', 'COMPLETED', 'NOT_INITIATED'],
      default: 'NOT_INITIATED'
    },
    multiAssembly: { type: Boolean, default: false },
    filePartName: { type: String },
    is_archived: { type: Boolean, default: false },
    is_actuator_type: { type: Boolean, default: false },
    actuator_motion_control: ItemMotionControlSchema,
    not_for_public_use: { type: Boolean, default: true },
    created_by: { type: Schema.Types.ObjectId, ref: 'User' },
    updated_by: { type: Schema.Types.ObjectId, ref: 'User' }
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
