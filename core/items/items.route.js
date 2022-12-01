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
    controller.addItemV2
]);

router.get("/", [
    authorization, controller.getItemV2
]);

router.post("/getbyuser", [
    authorization, controller.getItemByUser
]);

router.put("/", [
    authorizationAdmin,
    upload.single('img'),
    controller.editItemV2
]);

router.delete("/:id", [
    authorizationAdmin,
    controller.deleteItem
]);

router.post('/buy', [
    authorization,
    controller.buyItem
]);



module.exports = router;