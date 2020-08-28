const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const auth = require("../../middleware/auth");

router.get("/", (req, res) => res.render("register"));

router.post("/", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }
  User.findOne({ email }).then(user => {
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }
    bcrypt.compare(password, user.password).then(isMatch => {
      // if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });
      jwt.sign(
        { id: user.id },
        config.get("JWTSecret"),
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email
            }
          });
        }
      );
    });
  });
});

//handle logout
router.get("/user", auth, (req, res) => {
  // do '/user',auth,(req,res) to require authentication for this route
  User.findById(req.user.id)
    .populate("userAccess")
    .select("-password")
    .then(user => res.json(user));
});

module.exports = router;
