var items = require('../../model/items.model');
var users = require('../../model/users.model')
var fs = require('fs');
const sharp = require('sharp');
const path = require('path');
var config = require('../../config/config')
var ip = require("ip");
const util = require('util')
var ObjectId = require('mongoose').Types.ObjectId;
var autoIncrement = require("mongodb-autoincrement");

// exports.addItem = async (req, res) => {
//     try {
//         const { image, type, name, rarity,
//             price, use_type, quantity, phase_use,
//             description, attribute } = req.body;
//         const { filename: filename } = req.file;
//         if (req.file) {
//             await checkDir();
//             await sharp(req.file.path)
//                 .resize(200, 200)
//                 .jpeg({ quality: 90 })
//                 .toFile(
//                     path.resolve(req.file.destination, '../img-items', filename)
//                 )
//             fs.unlinkSync(req.file.path)
//         }

//         var itemModel = new items();
//         itemModel.id = "1";
//         itemModel.image = filename == undefined || null || "" ? "" : `${ip.address()}:3000/image/${filename}`;
//         itemModel.type = type;
//         itemModel.name = name;
//         itemModel.rarity = rarity;
//         itemModel.price = price;
//         itemModel.use_type = use_type;
//         itemModel.quantity = quantity;
//         itemModel.phase_use = phase_use;
//         itemModel.description = description;
//         // console.log( util.inspect(attribute, {showHidden: false, depth: null, colors: true}))
//         let _ob;
//         if (typeof (attribute) === 'string' || attribute instanceof String) {
//             _ob = JSON.parse(attribute);
//         } else {
//             _ob = attribute;
//         }
//         itemModel.attribute = _ob;
//         const result = await itemModel.save();
//         return res
//             .status(200)
//             .json({
//                 statusCode: "200",
//                 message: "Add Item successfully 😊 👌"
//             });
//     }
//     catch (err) {
//         console.log(err)
//         return res
//             .status(400)
//             .json({
//                 statusCode: "400",
//                 message: `err : ${err}`
//             });
//     }
// }

exports.addItem = async (req, res) => {
    try {
        const { image, type, name, rarity,
            price, use_type, quantity, phase_use,
            description, attribute } = req.body;
        let img_filename = "";
        if (req.file) {
            const { filename } = req.file;
            img_filename = filename;
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
        itemModel.id = await getNextSequence();
        itemModel.image = img_filename == (undefined || null || "") ? null : `${ip.address()}:3000/image/${img_filename}`;
        itemModel.type = type == undefined ? null : type;
        itemModel.name = name == undefined ? null : name;
        itemModel.rarity = rarity == undefined ? null : rarity;
        itemModel.price = price == undefined ? null : price;
        itemModel.use_type = use_type == undefined ? null : use_type;
        itemModel.quantity = quantity == undefined ? null : quantity;
        itemModel.phase_use = phase_use == undefined ? null : phase_use;
        itemModel.description = description == undefined ? null : description;
        let _ob;
        if (typeof (attribute) === 'string' || attribute instanceof String) {
            _ob = JSON.parse(attribute);
        } else {
            _ob = attribute;
        }
        itemModel.attribute = _ob;
        const result = await itemModel.save();
        return res
            .status(200)
            .json({
                statusCode: "200",
                message: "Add item successfully 😊 👌"
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

const getNextSequence = async () => {
    var ret = await items.find({}).sort({ id: -1 }).collation({ locale: "en_US", numericOrdering: true }).limit(1)
    return (parseInt(ret[0].id) + 1).toString();
}


const checkDir = async () => {
    fs.exists(path.resolve(__dirname, config.pathImg.pathItem), function (exists) {
        if (!exists) {
            fs.mkdir(path.resolve(__dirname, config.pathImg.pathItem), { recursive: true }, function (err) {
                if (err) {
                    console.log(err)
                }
            })
        }
    });
}

exports.editItem = async (req, res) => {
    try {
        const { id } = req.body;
        let img_filename = "";
        if (req.file) {
            const { filename } = req.file;
            img_filename = filename;
            await checkDir();
            await sharp(req.file.path)
                .resize(200, 200)
                .jpeg({ quality: 90 })
                .toFile(
                    path.resolve(req.file.destination, '../img-items', filename)
                )
            fs.unlinkSync(req.file.path)
        }
        if (id == undefined || id == "") {
            return res
                .status(400)
                .json({
                    message: "err : ValidationError: id: Path `id` is required.",
                    statusCode: "400",
                });
        }
        let dateUpdate = req.body;
        if (typeof dateUpdate != 'object') {
            dateUpdate = JSON.parse(dateUpdate);
        }
        let find = await items.findOne({ id: id }).exec();
        if (find) {
            dateUpdate['image'] = img_filename == (undefined || null || "") ? find.image : `${ip.address()}:3000/image/${img_filename}`;
            delete dateUpdate.id;
            items.updateOne(
                { "_id": ObjectId(find._id) },
                {
                    $set: dateUpdate
                },
                { upsert: 1 }
            ).exec();
            return res
                .status(200)
                .json({
                    statusCode: "200",
                    message: "Edit item successfully 😊 👌"
                });
        } else {
            return res
                .status(404)
                .json({
                    statusCode: "404",
                    message: "Get item Not Foud",
                    result: null
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

exports.getItem = async (req, res) => {
    try {
        const type = req.params.type;
        let find;
        if (type == undefined || type == "" || type == "all") {
            find = await items.find({}, { _id: 0 }).exec();
        } else {
            find = await items.find({ type: type }, { _id: 0 }).exec();
        }
        if (find && find.length > 0) {
            // var imageAsBase64 = fs.readFileSync(find.imgPath, 'base64');
            return res
                .status(200)
                .json({
                    statusCode: "200",
                    message: "Get item successfully 😊 👌",
                    result: find,
                });
        } else {
            return res
                .status(404)
                .json({
                    statusCode: "404",
                    message: "Get item not foud",
                    result: []
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

exports.getAll = async (req, res) => {
    try {
        let find = await items.find({}, { _id: 0 }).exec();
        if (find) {
            return res
                .status(200)
                .json({
                    statusCode: "200",
                    message: "Get item successfully 😊 👌",
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

exports.deleteItem = async (req, res) => {
    try {
        let id = req.params.id;
        let find = await items.findOne({ id: id }).exec();
        if (find) {
            const query = { _id: ObjectId(find._id) };
            console.log(query)
            const result = await items.deleteOne(query);
            if (result.deletedCount === 1) {
                console.log("Successfully deleted one document.");
            } else {
                console.log("No documents matched the query. Deleted 0 documents.");
            }
            return res
                .status(200)
                .json({
                    statusCode: "200",
                    message: "Delete item successfully 😊 👌",
                    result: `deletedCount ${result.deletedCount}`
                });
        } else {
            return res
                .status(404)
                .json({
                    statusCode: "404",
                    message: "Item not foud",
                    result: null
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

getLengthInObject = (obj) => {
    return Object.keys(obj).length
}


exports.buyItem = async (req, res) => {
    try {
        const { eth_address, id, quantity } = req.body;
        if (eth_address == undefined || eth_address == "") {
            return res
                .status(400)
                .json({
                    message: "err : ValidationError: eth_address: Path `eth_address` is required.",
                    statusCode: "400",
                });
        } else if (id == undefined || id == "") {
            return res
                .status(400)
                .json({
                    message: "err : ValidationError: id: Path `id` is required.",
                    statusCode: "400",
                });
        } else if (quantity == undefined || quantity == "") {
            return res
                .status(400)
                .json({
                    message: "err : ValidationError: quantity: Path `quantity` is required.",
                    statusCode: "400",
                });
        }
        let itemFind = await items.findOne({ id: id }).exec();
        if (itemFind) {
            let userFind = await users.findOne({ "eth_address": eth_address }).exec();
            let filter = userFind.item.find(item =>
                item.id.toString() == itemFind._id.toString()
            )
            if (filter) {
                await users.updateOne(
                    {
                        "eth_address": eth_address,
                        "item.id": itemFind._id
                    },
                    {
                        $set: {
                            "item.$.quantity": filter.quantity + quantity,
                            lastUpdate: Date.now()
                        }
                    }
                ).exec()
            } else {
                await users.updateOne(
                    { "eth_address": eth_address },
                    {
                        $push: {
                            "item": {
                                "id": itemFind._id,
                                "quantity": quantity,
                            },

                        },
                        $set: {
                            lastUpdate: Date.now()
                        }
                    }
                ).exec();
            }
            return res
                .status(200)
                .json({
                    statusCode: "200",
                    message: "Buy item successfully 😊 👌"
                });
        } else {
            return res
                .status(404)
                .json({
                    statusCode: "404",
                    message: "Get item Not Foud",
                    result: null
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