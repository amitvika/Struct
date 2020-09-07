require('./aliases');
require('./config/dbConnection');

const express = require("express"); //brings in express
const app = express();
const passport = require("passport");

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());


const testAddon = require("@build/Release/testaddon.node");
console.log("addon", testAddon);
console.log("hello ", testAddon.hello());
console.log("add ", testAddon.add(5, 10));

const prevInstance = new testAddon.ClassExample(4.3);
console.log("Initial value : ", prevInstance.getValue());
console.log("After adding 3.3 : ", prevInstance.add(3.3));

const newFromExisting = new testAddon.ClassExample(prevInstance);

console.log("Testing class initial value for derived instance");
console.log(newFromExisting.getValue());

module.exports = testAddon;
//

require("./config/passport")(passport);

app.use('/', require('./routes/index'))
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server started on port", PORT));
