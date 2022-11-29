var express = require('express')
var router = express.Router();
var controller = require("./nft.controller")
var authorizationAdmin = require("../../middleware/authAdmin");
var authorization = require("../../middleware/auth");

router.get('/land-nft', authorization, controller.getLandNFT);
router.post('/add-player-land', authorization, controller.addPlayerLandV2);
router.post('/getbyuser', authorization, controller.getByUser);

router.get('/get-nft-all',authorizationAdmin, controller.getNftAll);

// smart Contract
router.post('/mint', authorizationAdmin, controller.mint);
router.post('/set-uri', authorizationAdmin, controller.setUrl);
router.post('/bal', controller.bal);

router.get('/get-id',authorization, controller.randomTokenId);

router.post('/test', controller.testAdd);

module.exports = router;