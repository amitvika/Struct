const mongoose = require("mongoose");
var Schema = mongoose.Schema;
//Define the User model schema(filed structure)
const ClientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    domain_name: { type: String },
    is_domain_active: { type: Boolean, default: false },
    logo_name: { type: String },
    logo_url: { type: String },
    linked_items: [{ type: Schema.Types.ObjectId, ref: "Item" }],
    is_archived: { type: Boolean, default: false },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updated_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, {
    timestamps: true
});
//this converts the schema into a model
const Client = mongoose.model("Client", ClientSchema);
//allows for exporting the schema
module.exports = Client;
