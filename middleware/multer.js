var multer = require('multer');
var config = require('../config/config')
const fs = require('fs');

var storage = multer.diskStorage({
    destination: (req, file, callback) => {
        fs.exists(config.pathImg.pathTmp, function (exists) {
            if (exists) {
                callback(null, config.pathImg.pathTmp);
            } else {
                fs.mkdir(config.pathImg.pathTmp, function (err) {
                    if (err) {

                    } else {
                        callback(null, config.pathImg.pathTmp);
                    }
                })
            }
        });
    },
    filename: function (req, file, cb) {
        var ext = file.originalname.split('.').pop();
        var filename = file.originalname.split('.')[0]
        cb(null, filename + '.' + ext)
    }
});
  
var upload = multer({ storage: storage });

module.exports = upload