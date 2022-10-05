var express = require('express')
var router = express.Router();
const { check } = require('express-validator');
var controller = require("./users.controller")
var authorization = require("../../middleware/auth")

router.get('/', authorization, controller.getUser);
router.put('/', authorization, controller.editUser);

module.exports = router;