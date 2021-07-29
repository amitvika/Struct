const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ItemOrderSchema = new mongoose.Schema({
  item_id: { type: Schema.Types.ObjectId, ref: "Item" },
  vendor_id: { type: Schema.Types.ObjectId, ref: "Vendor" },
  estimated_delivery_date: { type: Date },
  item_quantity: { type: Number, default: 0 },
  unit_cost: { type: Number, default: 0 },
  created_by: { type: Schema.Types.ObjectId, ref: "User" },
  updated_by: { type: Schema.Types.ObjectId, ref: "User" },
  is_archived: { type: Boolean, default: false }
}, {
  timestamps: true
});

const ItemOrder = mongoose.model("ItemOrder", ItemOrderSchema);
module.exports = ItemOrder;
