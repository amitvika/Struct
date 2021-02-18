require('./aliases');
require('./config/dbConnection');

const express = require("express"); //brings in express
const app = express();
const passport = require("passport");
const cors = require('cors')

global.MY_ROOT = __dirname

var whitelist = ['https://internal.struct.services', 'http://localhost:3000']
var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

// Then pass them to cors:
app.use(cors(corsOptions));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

require("./config/passport")(passport);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/', require('./routes/index'))
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server started on port", PORT));