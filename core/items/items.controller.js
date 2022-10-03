var items = require('../../model/items.model');
var fs = require('fs');
const sharp = require('sharp');
const path = require('path');
var config = require('../../config/config')



exports.addItem = async (req, res, next) => {
    try {

        const { image, type, name, rarity,
            price, use_type, quantity, phase_use,
            description, attribute } = req.body;
        if(req.file){
            const { filename: filename } = req.file;
            await sharp(req.file.path)
                .resize(200, 200)
                .jpeg({ quality: 90 })
                .toFile(
                    path.resolve(req.file.destination, '../img-items', filename)
                )
            fs.unlinkSync(req.file.path)
        }    

        let at = {}

        var itemModel = new items();
        itemModel.id = "1";
        // itemModel.image = `${config.pathImg.pathItem}/${filename}`;
        itemModel.type = type;
        itemModel.name = name;
        itemModel.rarity = rarity;
        itemModel.price = price;
        itemModel.use_type = use_type;
        itemModel.quantity = quantity;
        itemModel.phase_use = phase_use;
        itemModel.description = description;
        itemModel.attribute = { item: "dddd" };
        console.log(itemModel)
        const result = await itemModel.save();
        return res
            .status(200)
            .json({
                statusCode: "200",
                message: "Add Item successfully 😊 👌",
                test: attribute
            });
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

exports.getItem = async (req, res, next) => {
    try {
        let name = req.params.name;
        let find = await items.findOne({ name: name }, { _id: 0 }).exec();
        if (find) {
            var imageAsBase64 = fs.readFileSync(find.imgPath, 'base64');
            return res
                .status(200)
                .json({
                    statusCode: "200",
                    message: "Get Item successfully 😊 👌",
                    result: find,
                    img: imageAsBase64
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
