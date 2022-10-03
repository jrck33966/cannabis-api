var express = require('express')
var router = express.Router();
var fs = require('fs');
const path = require('path');

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

module.exports = router;