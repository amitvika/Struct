require('./aliases');
require('./config/dbConnection');

const express = require("express"); //brings in express
const app = express();
const passport = require("passport");

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

require("./config/passport")(passport);

app.use('/', require('./routes/index'))
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server started on port", PORT));