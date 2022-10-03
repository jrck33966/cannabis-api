var express = require('express')
var router = express.Router();
const { check } = require('express-validator');
var controller = require("./login.controller")
var authorization = require("../middleware/auth")

router.get('/',  (req, res) => res.send('Welcome to API'))
router.post('/signin',[check('eth_address').not().isEmpty()], controller.signin,controller.lonig)
router.post("/login", [check('eth_address').not().isEmpty()],controller.lonig);
router.post("/logout", authorization,controller.logout);

module.exports = router;