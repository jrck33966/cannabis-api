var express = require('express')
var router = express.Router();
var controller = require("./reporting.controller")
var authorizationAdmin = require("../../middleware/authAdmin");

router.post('/',authorizationAdmin,controller.get);

module.exports = router;