var express = require('express')
var router = express.Router();
const { check } = require('express-validator');
var controller = require("./items.controller")
var authorization = require("../../middleware/auth")
var upload = require('../../middleware/multer')

router.post('/', [
    upload.single('img'),
    controller.addItem
]);

// router.get('/:name', [
//     controller.getItem
// ]);

router.get('/all', 
    controller.getAll
);

module.exports = router;