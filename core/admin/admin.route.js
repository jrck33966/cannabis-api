var express = require('express')
var router = express.Router();
const { check } = require('express-validator');
var controller = require("./admin.controller")
var authorizationAdmin = require("../../middleware/authAdmin");
var fs = require('fs');
const path = require('path');

router.post('/login',controller.adminLogin);
router.post('/logout',authorizationAdmin,controller.adminlogout);

module.exports = router;