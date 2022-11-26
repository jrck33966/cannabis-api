var express = require('express')
var router = express.Router();
var controller = require("./planting.controller")
var authorization = require("../../middleware/auth");

router.post('/start', authorization, controller.startPlanting);
router.post('/get', authorization, controller.getPlanting);
router.post('/get/test', authorization, controller.testPlanting);
router.post('/get/test-by-date', authorization, controller.testPlantingByDate);

router.post('/discard', authorization, controller.disCard);
router.post('/harvest', authorization, controller.harvest);

module.exports = router;