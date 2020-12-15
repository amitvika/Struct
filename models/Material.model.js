const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const Schema = mongoose.Schema;

const MaterialSchema = new mongoose.Schema({
  name: { type: String },
  description: { type: String },
  chemicalComposition: [
    {
      elementName: { type: String },
      max: { type: Number, default: 0, get: getDecimalNumber, set: setDecimalNumber },
      min: { type: Number, default: 0, get: getDecimalNumber, set: setDecimalNumber },
      unit: { type: String }
    }
  ],
  properties: [{
    name: { type: String },
    value: [{
      max: { type: Number, default: 0, get: getDecimalNumber, set: setDecimalNumber },
      min: { type: Number, default: 0, get: getDecimalNumber, set: setDecimalNumber },
      unit: { type: String }
    }]
  }],
  applications: [{ type: String }]
});

function getDecimalNumber(val) { return (val / 1000000); }
function setDecimalNumber(val) { return (val * 1000000); }

MaterialSchema.plugin(mongoosePaginate);

// mongoose.set('debug', function (coll, method, query, doc) {
//   console.log("----"+coll + " --- " + method + " --- " + JSON.stringify(query) + "--" + JSON.stringify(doc));
// });

const Material = mongoose.model("Material", MaterialSchema);
module.exports = Material;
