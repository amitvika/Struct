const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemMotionControlSchema = new mongoose.Schema(
  {
    item_id: { type: Schema.Types.ObjectId, ref: 'Item' },
    child_sequence_number: { type: Number, default: 0 },
    child_part_name: { type: String },
    child_part_display_name: { type: String },
    is_actuator_or_chain_link: { type: Boolean, default: false },
    is_linear_or_rotational: { type: Boolean, default: false },
    cylindrical_axis_of_rotation_or_movement: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 }
    },
    angle_or_distant_limit: { type: Number, default: 0 },
    created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updated_by: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  {
    timestamps: true
  }
);

const Item = mongoose.model('ItemMotionControl', ItemMotionControlSchema);

module.exports = Item;
