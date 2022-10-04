var express = require('express')
var router = express.Router();
const { check } = require('express-validator');
var controller = require("./items.controller")
var authorization = require("../../middleware/auth")
var upload = require('../../middleware/multer')

// router.post('/add', [
//     upload.single('img'),
//     controller.addItem
// ]);

router.post("/get",[authorization,controller.getItem]);

// router.get('/all',
//     authorization,
//     controller.getAll
// );

module.exports = router;