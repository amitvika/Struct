const express = require("express"); //brings in express
const app = express();
const config = require("config");
const mongoose = require("mongoose");
const DBuri = config.get("mongoURI");

mongoose
  .connect(DBuri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected..."))
  .catch(err => console.log(err));

app.use(express.json());

const passport = require("passport");
require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/upload", require("./routes/api/upload"));
app.use("/api/items", require("./routes/api/items"));
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/clients", require("./routes/api/clients"));
app.use("/api/userAccessTypes", require("./routes/api/userAccessTypes"));
app.use(
  "/api/userAccessConfigurations",
  require("./routes/api/userAccessConfigurations")
);
app.use(
  "/api/userAccessConfigurationUsers",
  require("./routes/api/userAccessConfigurationUsers")
);
app.use("/api/changeTracking", require("./routes/api/changeTracking"));
app.use("/api/userList", require("./routes/api/userList"));
app.use("/api/processGroups", require("./routes/api/processGroups"));
app.use("/api/processGroup", require("./routes/api/processGroup"));
app.use("/api/processdata", require("./routes/api/processdata"));
app.use("/api/processes", require("./routes/api/processes"));
//steps to create a new saved entity:
////create model,
////create get, post, update, edit requests from UI or actions
////create api to modify db
////create route statement here

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server started on port", PORT));
