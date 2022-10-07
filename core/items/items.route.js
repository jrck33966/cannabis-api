var express = require('express')
var router = express.Router();
const { check } = require('express-validator');
var controller = require("./items.controller")
var authorization = require("../../middleware/auth")
var authorizationAdmin = require("../../middleware/authAdmin")
var upload = require('../../middleware/multer')

router.post('/', [
    authorizationAdmin,
    upload.single('img'),
    controller.addItem
]);

router.get("/:type", [
    authorization, controller.getItem
]);

router.put("/", [
    authorizationAdmin,
    upload.single('img'),
    controller.editItem
]);

router.delete("/:id", [
    authorizationAdmin,
    controller.deleteItem
]);



module.exports = router;