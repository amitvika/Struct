const express = require("express");
const router = express.Router();
const Item = require("../../models/Item");
const auth = require("../../middleware/auth");

router.get("/", (req, res) => {
  Item.find()
    .sort({ date: -1 }) //sorts descending
    .then(items => res.json(items));
});

router.post("/", auth, (req, res) => {
  const newItem = new Item({
    name: req.body.name
  });
  newItem
    .save()
    .then(item => res.json(item))
    .catch(error => console.log(error));
});

router.delete("/:id", auth, (req, res) => {
  Item.findByIdAndRemove(req.params.id)
    .then(() => res.json({ success: true }))
    .catch(err => res.status(404).json({ success: false }));
});

module.exports = router;
