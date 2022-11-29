const items = require('../../model/items.model');
const users = require('../../model/users.model');
const income = require('../../model/income.model');
var fs = require('fs');
const sharp = require('sharp');
const path = require('path');
var config = require('../../config/config')
var ip = require("ip");
const util = require('util')
var ObjectId = require('mongoose').Types.ObjectId;
var autoIncrement = require("mongodb-autoincrement");
var logger = require('../../config/configLog')
const moment = require('moment');

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
            price, use_type, quantity_user, phase_use,
            description, attribute } = req.body;
        let img_filename = "";
        await checkDir();
        let idImage = await getNextSequence();
        if (req.file) {
            const { filename } = req.file;
            let typeFile = filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
            img_filename = `${idImage}_${makeNameImage(5)}.${typeFile}`;
            const move = path.resolve(__dirname, config.pathImg.pathItem);
            fs.renameSync(`${req.file.destination}/${filename}`, `${move}/${img_filename}`);
        }
        let originalPath = img_filename == (undefined || null || "") ? null : path.resolve(req.file.destination, '../img-items', img_filename)
        var itemModel = new items();
        itemModel.id = idImage;
        itemModel.image = img_filename == (undefined || null || "") ? null : `${ip.address()}:3000/image/${img_filename}`;
        itemModel.type = type == undefined ? null : type;
        itemModel.name = name == undefined ? null : name;
        itemModel.rarity = rarity == undefined ? null : rarity;
        itemModel.price = price == undefined ? null : price;
        itemModel.use_type = use_type == undefined ? null : use_type;
        itemModel.quantity_user = quantity_user == undefined ? null : quantity_user;
        itemModel.phase_use = phase_use == undefined ? null : phase_use;
        itemModel.description = description == undefined ? null : description;
        itemModel.imageOriginalPath = originalPath;
        let _ob;
        if (typeof (attribute) === 'string' || attribute instanceof String) {
            _ob = JSON.parse(attribute);
        } else {
            _ob = attribute;
        }
        itemModel.attribute = _ob;
        const result = await itemModel.save();
        logger.info(`addItem success by username: ${req.id}`)
        return res
            .status(200)
            .json({
                statusCode: "200",
                message: "Add item successfully 😊 👌"
            });
    }
    catch (err) {
        logger.error(`addItem error: ${err}`);
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
    return fs.exists(path.resolve(__dirname, config.pathImg.pathItem), function (exists) {
        if (!exists) {
            fs.mkdirSync(path.resolve(__dirname, config.pathImg.pathItem), { recursive: true }, function (err) {
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
        let dateUpdate = req.body;
        let d = await checkDir();
        console.log(d)
        if (id == undefined || id == "") {
            return res
                .status(400)
                .json({
                    message: "err : ValidationError: id: Path `id` is required.",
                    statusCode: "400",
                });
        }

        if (req.file) {
            const { filename } = req.file;
            let typeFile = filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
            img_filename = `${dateUpdate.id}_${makeNameImage(5)}.${typeFile}`;
            const move = path.resolve(__dirname, config.pathImg.pathItem);
            fs.renameSync(`${req.file.destination}/${filename}`, `${move}/${img_filename}`);
        }
        if (typeof dateUpdate != 'object') {
            dateUpdate = JSON.parse(dateUpdate);
        }

        let find = await items.findOne({ id: id }).exec();
        if (find) {
            dateUpdate['image'] = img_filename == (undefined || null || "") ? find.image : `${ip.address()}:3000/image/${img_filename}`;
            let originalPath = img_filename == (undefined || null || "") ? find.imageOriginalPath : path.resolve(req.file.destination, '../img-items', img_filename)
            dateUpdate['imageOriginalPath'] = originalPath
            if (img_filename != (undefined || null || "")) {
                if (fs.existsSync(find.imageOriginalPath)) {
                    fs.unlinkSync(find.imageOriginalPath)
                }
            }
            if (dateUpdate['attribute']) {
                let _ob;
                if (typeof (dateUpdate['attribute']) === 'string' || dateUpdate['attribute'] instanceof String) {
                    console.log("here")
                    _ob = JSON.parse(dateUpdate['attribute'])
                } else {
                    _ob = attribute;
                }
                dateUpdate['attribute'] = _ob;
            }
            delete dateUpdate.id;
            items.updateOne(
                { "_id": ObjectId(find._id) },
                {
                    $set: dateUpdate
                },
                { upsert: 1 }
            ).exec();
            logger.info(`editItem success by username: ${req.id}`)
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
        logger.error(`addItem error: ${err}`);
        return res
            .status(400)
            .json({
                statusCode: "400",
                message: `err : ${err}`
            });
    }
}

// exports.getItem = async (req, res) => {
//     try {
//         const type = req.params.type;
//         let find;
//         if (type == undefined || type == "" || type == "all") {
//             find = await items.find({}, { _id: 0 }).exec();
//         } else {
//             find = await items.find({ type: type }, { _id: 0 }).exec();
//         }
//         if (find && find.length > 0) {
//             // var imageAsBase64 = fs.readFileSync(find[0].imageOriginalPath, 'base64');
//             find.map(item => {
//                 try {
//                     if (fs.existsSync(item.imageOriginalPath)) {
//                         var imageAsBase64 = fs.readFileSync(item.imageOriginalPath, 'base64');
//                         item['image'] = imageAsBase64
//                         item['imageOriginalPath'] = null
//                     } else {
//                         item['image'] = null
//                         item['imageOriginalPath'] = null
//                     }
//                 } catch (err) {
//                     console.error(err)
//                 }

//             })
//             logger.info(`getItem success by username: ${req.userId}`)
//             return res
//                 .status(200)
//                 .json({
//                     statusCode: "200",
//                     message: "Get item successfully 😊 👌",
//                     result: find,
//                 });
//         } else {
//             logger.warn(`getItem Get item type :${type} not foud `);
//             return res
//                 .status(404)
//                 .json({
//                     statusCode: "404",
//                     message: "Get item not foud",
//                     result: []
//                 });
//         }
//     }
//     catch (err) {
//         logger.error(`getItem error: ${err}`);
//         return res
//             .status(400)
//             .json({
//                 statusCode: "400",
//                 message: `err : ${err}`
//             });
//     }
// }

exports.getItem = async (req, res) => {
    try {
        const query = req.query;
        let type = query.type
        let typeUpper = new RegExp(["^", type, "$"].join(""), "i");
        let id = query.id;
        let find;
        if ((type == undefined || type == '') && (id == undefined || id == '')) {
            find = await items.find({}, { _id: 0 }).exec();
        } else if ((type != undefined && type != '') && (id != undefined && id != '')) {
            find = await items.aggregate([
                {
                    $match: {
                        $and:
                            [
                                { id: id },
                                { type: typeUpper }
                            ]
                    }
                },
                {
                    $project: {
                        _id: 0
                    }
                }
            ]).exec();
        } else if (type != undefined && type != '') {
            find = await items.find({ type: typeUpper }, { _id: 0 }).exec();
        } else if (id != undefined && id != '') {
            find = await items.find({ id: id }, { _id: 0 }).exec();
        }
        if (find && find.length > 0) {
            find.map(item => {
                try {
                    if (fs.existsSync(item.imageOriginalPath)) {
                        var imageAsBase64 = fs.readFileSync(item.imageOriginalPath, 'base64');
                        item['image'] = imageAsBase64
                        item['imageOriginalPath'] = null
                    } else {
                        item['image'] = null
                        item['imageOriginalPath'] = null
                    }
                } catch (err) {
                    console.error(err)
                }

            })
            logger.info(`getItem success by username: ${req.userId}`)
            return res
                .status(200)
                .json({
                    statusCode: "200",
                    message: "Get item successfully 😊 👌",
                    result: find,
                });
        } else {
            logger.warn(`getItem Get item not foud `);
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
        logger.error(`getItem error: ${err}`);
        return res
            .status(400)
            .json({
                statusCode: "400",
                message: `err : ${err}`
            });
    }
}

exports.getItemByUser = async (req, res) => {
    try {
        // const id = req.userId
        const { eth_address } = req.body
        let find = await users.aggregate([
            { $match: { eth_address: eth_address } },
            { $unwind: "$item" },
            {
                $lookup: {
                    from: "cannabis_items",
                    localField: "item.id",
                    foreignField: "_id",
                    as: "itemUser"
                }

            },
            {
                $addFields: {
                    "itemUser.quantity_user": "$item.quantity"
                }
            },
            { $unset: "itemUser._id" },
            { $unwind: "$itemUser" },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            {
                                $arrayToObject: {
                                    $map: {
                                        input: {
                                            $objectToArray: "$itemUser"
                                        },
                                        in: [
                                            "$$this.k", "$$this.v"
                                        ]
                                    }
                                }
                            }
                        ]
                    }
                }
            }
            // { $project: { _id: 0, itemUser: 1 } }
        ]).exec();
        if (find) {
            find.map(item => {
                try {
                    if (fs.existsSync(item.imageOriginalPath)) {
                        var imageAsBase64 = fs.readFileSync(item.imageOriginalPath, 'base64');
                        item['image'] = imageAsBase64
                        item['imageOriginalPath'] = null
                    } else {
                        item['image'] = null
                        delete item['imageOriginalPath']
                    }
                } catch (err) {
                    console.error(err)
                }

            })
            logger.info(`getItemByUser success by username: ${req.userId}`)
            return res
                .status(200)
                .json({
                    statusCode: "200",
                    message: "Get item successfully 😊 👌",
                    result: find,
                });
        } else {
            logger.warn(`getItemByUser get user:${req.userId} not foud`);
            return res
                .status(404)
                .json({
                    statusCode: "404",
                    message: "Get user not foud",
                    result: []
                });
        }
    }
    catch (err) {
        logger.error(`getItemByUser error: ${err}`);
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
            logger.info(`deleteItem success by username: ${req.id}`)
            return res
                .status(200)
                .json({
                    statusCode: "200",
                    message: "Delete item successfully 😊 👌",
                    result: `deletedCount ${result.deletedCount}`
                });
        } else {
            logger.warn(`deleteItem get itemId:${id} not foud`);
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
        logger.error(`deleteItem error: ${err}`);
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
        let { eth_address, id, quantity } = req.body;
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

        if (typeof (quantity) === 'string') {
            try {
                quantity = parseInt(quantity);
            } catch (err) {
                return res
                    .status(400)
                    .json({
                        statusCode: "400",
                        message: `err : ${err}`
                    });
            }

        }
        let itemFind = await items.findOne({ id: id }).exec();
        if (itemFind) {
            let userFind = await users.findOne({ "eth_address": eth_address }).exec();
            if (userFind) {
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
                                buy_Date: Date.now(),
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
                                buy_Date: Date.now(),
                                lastUpdate: Date.now()
                            }
                        }
                    ).exec();
                }

                let newIncome = new income()
                newIncome.eth_address = eth_address;
                newIncome.itemId = id;
                newIncome.quantity = quantity;
                newIncome.total_price = parseInt(itemFind.price) * parseInt(quantity);
                let date = moment(moment(Date.now()).utc(0).format('YYYYMMDDHHmmssZZ'), "YYYYMMDDHHmmssZZ")
                newIncome.buy_date = date;

                await income.create(newIncome);


                logger.info(`buyItem ItemId:${id} success by username: ${req.userId}`)
                return res
                    .status(200)
                    .json({
                        statusCode: "200",
                        message: "Buy item successfully 😊 👌"
                    });
            }
            else {
                logger.warn(`buyItem get eth_address:${eth_address} not foud`);
                return res
                    .status(404)
                    .json({
                        statusCode: "404",
                        message: "Get user Not Foud",
                        result: null
                    });
            }

        } else {
            logger.warn(`buyItem get itemId:${id} not foud`);
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
        logger.error(`buyItem error: ${err}`);
        return res
            .status(400)
            .json({
                statusCode: "400",
                message: `err : ${err}`
            });
    }
}

function makeNameImage(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}