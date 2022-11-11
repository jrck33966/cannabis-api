var express = require('express')
var router = express.Router();
var controller = require("./nft.controller")
var authorizationAdmin = require("../../middleware/authAdmin");
var authorization = require("../../middleware/auth");

router.get('/land-nft', authorization, controller.getLandNFT);
router.post('/add-player-land', authorization, controller.addPlayerLand);
router.post('/getbyuser', authorization, controller.getByUser);

// smart Contract
router.post('/mint', authorizationAdmin, controller.mint);
router.post('/set-uri', authorizationAdmin, controller.setUrl);

module.exports = router;