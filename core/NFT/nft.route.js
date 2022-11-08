var express = require('express')
var router = express.Router();
var controllerMint = require("./mint.controller")
var authorization = require("../../middleware/auth");

router.post('/mint', controllerMint.mint);


module.exports = router;