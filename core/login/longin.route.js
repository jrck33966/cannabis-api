var express = require('express')
var router = express.Router();
const { check } = require('express-validator');
var controller = require("./login.controller")
var authorization = require("../../middleware/auth");
var fs = require('fs');
const path = require('path');
//user
router.get('/', (req, res) => res.send('Welcome to API'));
router.post('/signin', createValidationFor('login'), controller.signin,controller.lonig);
router.post('/login', createValidationFor('login'), controller.lonig);
router.post("/logout", authorization, controller.logout);
router.get('/image/:name', (req, res) => {
    try {
        let filename = req.params.name;
        let strPath = `../../upload/img-items/${filename}`
        let p = path.resolve(__dirname, strPath)
        if (fs.existsSync(p)) {
            res.sendFile(`/upload/img-items/${filename}`, { root: '.' });
        } else {
            return res.status(404).send("Sorry can't find that!")
        }
    } catch (e) {
        return res.status(404).send("Sorry can't find that!")
    }

})
function createValidationFor(route) {
    switch (route) {
        case 'login':
            return [
                check('eth_address').not().isEmpty()
            ];

        default:
            return [];
    }
}


//admin
router.post('/admin/login',
    createValidationFor('login'),
    controller.adminLonig);

module.exports = router;