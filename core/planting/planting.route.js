var express = require('express')
var router = express.Router();
var controller = require("./planting.controller")
var authorization = require("../../middleware/auth");

router.post('/start', authorization, controller.startPlanting);
router.post('/get', authorization, controller.getPlanting);
router.post('/get/test', authorization, controller.getPlantingCheckDate);


module.exports = router;