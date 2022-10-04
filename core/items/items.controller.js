var items = require('../../model/items.model');
var fs = require('fs');
const sharp = require('sharp');
const path = require('path');
var config = require('../../config/config')
var ip = require("ip");
const util = require('util')


exports.addItem = async (req, res, next) => {
    try {
        const { image, type, name, rarity,
            price, use_type, quantity, phase_use,
            description, attribute } = req.body;
        const { filename: filename } = req.file;
        if (req.file) {
            await checkDir();
            await sharp(req.file.path)
                .resize(200, 200)
                .jpeg({ quality: 90 })
                .toFile(
                    path.resolve(req.file.destination, '../img-items', filename)
                )
            fs.unlinkSync(req.file.path)
        }

        var itemModel = new items();
        itemModel.id = "1";
        itemModel.image = filename == undefined || null || "" ? "" : `${ip.address()}:3000/image/${filename}`;
        itemModel.type = type;
        itemModel.name = name;
        itemModel.rarity = rarity;
        itemModel.price = price;
        itemModel.use_type = use_type;
        itemModel.quantity = quantity;
        itemModel.phase_use = phase_use;
        itemModel.description = description;
        // console.log( util.inspect(attribute, {showHidden: false, depth: null, colors: true}))
        let _ob;
        if( typeof(attribute) === 'string' || attribute instanceof String){
            _ob = JSON.parse(attribute);
        }else{
            _ob = attribute;
        }
        itemModel.attribute = _ob;
        const result = await itemModel.save();
        return res
            .status(200)
            .json({
                statusCode: "200",
                message: "Add Item successfully 😊 👌"
            });
    }
    catch (err) {
        console.log(err)
        return res
            .status(400)
            .json({
                statusCode: "400",
                message: `err : ${err}`
            });
    }
}

const checkDir = async () =>{
    fs.exists(path.resolve(__dirname, config.pathImg.pathItem), function (exists) {
        if (!exists) {
            fs.mkdir(path.resolve(__dirname, config.pathImg.pathItem),{ recursive: true }, function (err) {
                if (err) {
                    console.log(err)
                } 
            })
        }
    });
}

exports.getItem = async (req, res, next) => {
    try {
        const { type } = req.body;   
        let find;
        if( type == undefined || ""){
            find = await items.find({}, { _id: 0 }).exec(); 
        }else{
            find = await items.find({ type: type }, { _id: 0 }).exec(); 
        }      
        if (find && find.length > 0) {
            // var imageAsBase64 = fs.readFileSync(find.imgPath, 'base64');
            return res
                .status(200)
                .json({
                    statusCode: "200",
                    message: "Get Item successfully 😊 👌",
                    result: find,
                });
        }else{
            return res
            .status(404)
            .json({
                statusCode: "404",
                message: "Get Item Not Foud",
                result:[]
            });
        }
    }
    catch (err) {
        return res
            .status(400)
            .json({
                statusCode: "400",
                message: `err : ${err}`
            });
    }
}


exports.getAll = async (req, res, next) => {
    try {
        let find = await items.find({}, { _id: 0 }).exec();
        if (find) {
            return res
                .status(200)
                .json({
                    statusCode: "200",
                    message: "Get Item successfully 😊 👌",
                    result: find
                });
        }
    }
    catch (err) {
        return res
            .status(400)
            .json({
                statusCode: "400",
                message: `err : ${err}`
            });
    }
}