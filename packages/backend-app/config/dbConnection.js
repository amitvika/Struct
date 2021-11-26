const mongoose = require('mongoose');
const config = require('config');
const DBuri = config.get('mongoURI');

(() => {
  mongoose
    .connect(DBuri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch((err) => console.log(err));
})();
