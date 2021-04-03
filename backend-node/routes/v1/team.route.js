const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const checkAccess = require('../../middleware/checkAccess');
const TeamController = require('../../controller/team.controller');

router.use(auth);
router.use(checkAccess);

router.get("/", TeamController.get);

router.post("/", TeamController.upsert);

router.get("/users", TeamController.getUsers);

router.put('/access-role', TeamController.assignAccessRolesToTeams);

router.get('/my', TeamController.getMyTeams);


module.exports = router;
