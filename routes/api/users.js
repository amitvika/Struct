const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

router.get("/", (req, res) => res.send("login"));

//handle the login
router.post("/", (req, res, next) => {
  const { name, email, password, password2 } = req.body;
  if (!name || !email || !password || !password2) {
    return res.status(400).json({ msg: "Please enter all fields" });
  } else if (password != password2) {
    return res.status(400).json({ msg: "Passwords dont match" });
  } else if (password.length < 6) {
    return res
      .status(400)
      .json({ msg: "Passwords should be atleast 6 characters" });
  }

  User.findOne({ email }).then(user => {
    if (user) {
      return res.status(400).json({ msg: "Email already registered" });
    }
    const newUser = new User({
      email,
      name,
      password
    });
    bcrypt.genSalt(10, (err, salt) =>
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        // set password to hashed
        newUser.password = hash;
        // save user
        newUser
          .save()
          .then(user => {
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

            //res.redirect('/users/login');//when redirecting, cant use partials.  Need flash messages
          })
          .catch(err => console.log(err));
      })
    );
  });
});

module.exports = router;
