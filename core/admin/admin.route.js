var express = require('express')
var router = express.Router();
var controller = require("./admin.controller")
var authorizationAdmin = require("../../middleware/authAdmin");

router.post('/login',controller.adminLogin);
router.post('/logout',authorizationAdmin,controller.adminlogout);
router.post('/refreshtoken',controller.refreshToken);

module.exports = router;