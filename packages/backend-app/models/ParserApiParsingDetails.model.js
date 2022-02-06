const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ParserApiParsingDetailSchema = new Schema({}, { strict: false });
const ParserApiParsingDetail = mongoose.model(
  'ParserApiParsingDetail',
  ParserApiParsingDetailSchema,
  'parserapi_parsingdetails'
);

module.exports = ParserApiParsingDetail;
