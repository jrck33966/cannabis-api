var express = require('express')
var router = express.Router();
const { check } = require('express-validator');
var controller = require("./users.controller")
var authorization = require("../../middleware/auth")
var authorizationAdmin = require("../../middleware/authAdmin")

router.get('/', authorization, controller.getUser);
router.put('/', authorizationAdmin, controller.editUser);

module.exports = router;