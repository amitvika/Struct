const express = require("express");
const router = express.Router();
const AuthController = require('@controller/auth');

router.get("/", (req, res) => res.send("login"));

//handle the login
router.post("/", AuthController.register);

module.exports = router;
