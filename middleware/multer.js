var multer = require('multer');
var config = require('../config/config')
const fs = require('fs');
const path = require('path');
// let strPath = `../../upload/img-items/${filename}`
//         let p = path.resolve(__dirname, strPath)
var storage = multer.diskStorage({
    destination: (req, file, callback) => {
        fs.exists(path.resolve(__dirname, config.pathImg.pathTmp), function (exists) {
            if (exists) {
                callback(null, path.resolve(__dirname, config.pathImg.pathTmp));
            } else {
                fs.mkdir(path.resolve(__dirname, config.pathImg.pathTmp), { recursive: true }, function (err) {
                    if (err) {
                        console.log(err)
                    } else {
                        callback(null, path.resolve(__dirname, config.pathImg.pathTmp));
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