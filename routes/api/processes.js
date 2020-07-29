const express = require("express");
const router = express.Router();
const Process = require("../../models/Process");
const auth = require("../../middleware/auth");

router.get("/", (req, res) => {
  Process.find()
    .sort({ date: -1 }) //sorts descending
    .then(clients => {
      res.json(clients);
    });
});

router.post("/", auth, (req, res) => {
  const saveObject = {
    name: req.body.name
  };
  const newProcess = new Process(saveObject);
  newProcess
    .save()
    .then(item => {
      res.json(item);
    })
    .catch(error => console.log(error));
});

module.exports = router;
