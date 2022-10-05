var express = require('express')
var router = express.Router();
const { check } = require('express-validator');
var controller = require("./items.controller")
var authorization = require("../../middleware/auth")
var authorizationAdmin = require("../../middleware/authAdmin")
var upload = require('../../middleware/multer')

router.post('/add', [
    authorizationAdmin,
    upload.single('img'),
    controller.addItem
]);
router.post("/get", [authorization, controller.getItem]);
router.post("/edit", [authorizationAdmin, upload.single('img'), controller.editItem]);

// router.get('/all',
//     authorization,
//     controller.getAll
// );

module.exports = router;