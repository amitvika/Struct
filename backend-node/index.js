require('./aliases');
require('./config/dbConnection');

const express = require("express"); //brings in express
const app = express();
const passport = require("passport");
const cors = require('cors')

global.MY_ROOT = __dirname

app.use((req, res, next) => {
    // res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Origin", "https://internal.struct.services");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(cors())
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

require("./config/passport")(passport);

app.use('/', require('./routes/index'))
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server started on port", PORT));