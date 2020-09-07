const express = require("express");
const router = express.Router();
const auth = require("@middleware/auth");
const AuthController = require('@controller/auth');
const UserController = require('@controller/user');

router.get("/", (req, res) => res.render("register"));
router.post("/", AuthController.login);

//handle logout
router.get("/user", auth, UserController.get);

module.exports = router;
