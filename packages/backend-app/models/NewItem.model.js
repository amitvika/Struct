const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

//Define the User model schema(filed structure)
const NewItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    parent_id: { type: Schema.Types.ObjectId, ref: 'Item' },
    is_child_item: { type: Boolean, default: false },
    is_archived: { type: Boolean, default: false },
    created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updated_by: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  {
    timestamps: true
  }
);

NewItemSchema.statics.bulkInsertItems = function (items) {
  return this.insertMany(items);
};

NewItemSchema.plugin(mongoosePaginate);
const Item = mongoose.model('NewItem', NewItemSchema);
module.exports = Item;
