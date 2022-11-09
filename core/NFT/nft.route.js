var express = require('express')
var router = express.Router();
var controller = require("./nft.controller")
var authorization = require("../../middleware/authAdmin");

router.post('/mint',authorization, controller.mint);
router.post('/set-uri',authorization, controller.setUrl);

module.exports = router;