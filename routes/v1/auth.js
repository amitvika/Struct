const express = require("express");
const router = express.Router();
const auth = require("@middleware/auth");

const AuthController = require('@controller/auth');

router.get("/", (req, res) => res.render("register"));

router.post("/", AuthController.login);

//handle logout
router.get("/user", auth, (req, res) => {
  // do '/user',auth,(req,res) to require authentication for this route
  User.findById(req.user.id)
    .populate("userAccess")
    .select("-password")
    .then(user => res.json(user));
});

module.exports = router;
