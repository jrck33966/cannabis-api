var express = require('express')
var router = express.Router();
var controller = require("./reporting.controller")
var authorizationAdmin = require("../../middleware/authAdmin");

router.post('/date',authorizationAdmin,controller.getByDay);
router.post('/month',authorizationAdmin,controller.getByMonth);

module.exports = router;