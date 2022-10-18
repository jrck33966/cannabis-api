var planting = require('../../model/planting.model');
var users = require('../../model/users.model');
var items = require('../../model/items.model')
var ObjectId = require('mongoose').Types.ObjectId;
var moment = require('moment');
var logger = require('../../config/configLog')
var _ = require('underscore');

exports.startPlanting = async (req, res) => {
    try {
        let { eth_address, item_list } = req.body;
        //cut the number of item user
        let user_find = await users.findOne({ eth_address, eth_address }).exec();
        if (!user_find) {
            logger.warn(`getPlanting Get user eth_address : ${eth_address} not foud `);
            return res
                .status(404)
                .json({
                    statusCode: "404",
                    message: "Get user not foud",
                    result: []
                });
        }
        let flag_seed = false;
        let flag_error = false;
        let msg_error = [];
        for (let item of item_list) {
            for (let itemId of item['items']) {
                let find_item = await items.findOne({ "id": itemId }).exec();
                for (let item_user of user_find['item']) {
                    if (item_user.id.toString() == find_item._id.toString()) {
                        if (find_item.type == 'seed') {
                            if (!flag_seed) {
                                flag_seed = true;
                                if (item_user.quantity >= 1) {
                                    item_user.quantity = item_user.quantity - 1;
                                } else {
                                    flag_error = true;
                                    msg_error.push({
                                        type: find_item.type,
                                        name: find_item.name
                                    })
                                }
                            }
                        } else {
                            if (item_user.quantity >= 1) {
                                item_user.quantity = item_user.quantity - 1;
                            } else {
                                flag_error = true;
                                msg_error.push({
                                    type: find_item.type,
                                    name: find_item.name
                                })
                            }
                        }
                    }
                }
            }
        }

        if (flag_error) {
            return res
                .status(400)
                .json({
                    statusCode: "400",
                    message: "ERROR : item not enough amount",
                    result: msg_error
                });
        }


        await users.updateOne(
            { eth_address: eth_address },
            {
                $set: {
                    'item': user_find['item']
                }
            }
        )

        //create planting
        let plantingModel = new planting();
        plantingModel.eth_address = eth_address;
        plantingModel.item = item_list;
        plantingModel.phase = 1;
        plantingModel.start_phase_datetime = Date.now();
        for (let item of item_list) {
            switch (item.phase) {
                case "1":
                    plantingModel.next_phase_datetime = new Date().addDays(1);
                    plantingModel.grow_date_phase1 = 1;
                    plantingModel.survival_chance_phase1 = generateRandomInteger(1, 100);
                    break;
                case "2":
                    plantingModel.grow_date_phase2 = 2;
                    plantingModel.survival_chance_phase2 = generateRandomInteger(1, 100);
                    break;
                case "3":
                    plantingModel.grow_date_phase3 = 3;
                    plantingModel.survival_chance_phase3 = generateRandomInteger(1, 100);
                    break;
                default:
                    console.log("phase not found")
                    break;
            }
        }
        plantingModel.female_chance = generateRandomInteger(1, 100);
        plantingModel.production_quality = generateRandomInteger(1, 100);
        plantingModel.start_planting_date = Date.now();
        plantingModel.harvest_date = null;
        plantingModel.fail_date = null;
        plantingModel.is_planting = "planting";
        plantingModel.is_active = true;
        await planting.create(plantingModel);
        logger.info(`startPlanting success by eth_address: ${eth_address}`)
        return res
            .status(200)
            .json({
                statusCode: "200",
                message: "successfully"
            });
    }
    catch (err) {
        logger.error(`startPlanting error: ${err}`);
        return res
            .status(500)
            .json({
                statusCode: "500",
                message: "Server error"
            });
    }
}

exports.getPlanting = async (req, res) => {
    try {
        let { eth_address } = req.body;
        let find = await planting.find({ eth_address: eth_address });
        if (find.length > 0) {
            let arr_send = []
            for (let item of find) {
                if (item.is_active) {
                    if (item.is_planting == 'planting') {
                        let next = item.next_phase_datetime;
                        let cur_phase = item.phase;
                        if (cur_phase != 4) {
                            if (moment(Date.now()).format('YYYYMMDDHHmmssZZ') > moment(next).format('YYYYMMDDHHmmssZZ')) {
                                let nextPhase;
                                let alive;
                                let nextDate;
                                let curDate = item.next_phase_datetime;
                                let is_planting = 'planting';
                                switch (cur_phase) {
                                    case 1:
                                        alive = generateRandomForPercent(item.survival_chance_phase1);
                                        nextPhase = 2;
                                        nextDate = item.grow_date_phase2;
                                        break;
                                    case 2:
                                        alive = generateRandomForPercent(item.survival_chance_phase2);
                                        nextDate = item.grow_date_phase3;
                                        nextPhase = 3;
                                        break;
                                    case 3:
                                        alive = generateRandomForPercent(item.survival_chance_phase3);
                                        nextPhase = 4;
                                        break;
                                    case 4:
                                        break;
                                    default:
                                        alive = false;
                                        nextPhase = null;
                                        break;
                                }
                                if (alive) {
                                    console.log("รอด")
                                    let objectUpdate = {};
                                    var newDateObj = new Date(curDate).addDays(nextDate);
                                    if (nextPhase == 2 || nextPhase == 3) {
                                        objectUpdate['phase'] = nextPhase;
                                        objectUpdate['start_phase_datetime'] = item.next_phase_datetime
                                        objectUpdate['next_phase_datetime'] = newDateObj
                                    } else if (nextPhase == 4) {
                                        objectUpdate['phase'] = nextPhase;
                                    }
                                    await planting.updateOne(
                                        {
                                            "_id": ObjectId(item._id)
                                        },
                                        {
                                            $set: objectUpdate
                                        }
                                    ).exec();
                                    //update date after calculate
                                    item['phase'] = nextPhase;
                                    item['start_phase_datetime'] = item.next_phase_datetime
                                    item['next_phase_datetime'] = newDateObj
                                } else {
                                    console.log("ตาย")
                                    let is_planting = 'failed';
                                    await planting.updateOne(
                                        {
                                            "_id": ObjectId(item._id)
                                        },
                                        {
                                            $set: {
                                                is_planting: is_planting,
                                                fail_date: Date.now()
                                            }
                                        }
                                    ).exec();

                                    //update date after calculate
                                    item['is_planting'] = is_planting;
                                    let find_user = await users.findOne({ eth_address: eth_address }).exec();
                                    let arritem_user = find_user.item;

                                    // find_phase = 
                                    let find_item_planing
                                    switch (cur_phase) {
                                        case 1:
                                            find_item_planing = item['item'].filter(it => {
                                                return it.phase == '2' || it.phase == '3'
                                            });
                                            break;
                                        case 2:
                                            find_item_planing = item['item'].filter(it => {
                                                return it.phase == '3'
                                            });
                                            break;
                                        default:
                                            break;
                                    }
                                    //update return item to user
                                    let flag_seed = false;
                                    if (cur_phase == 1 || cur_phase == 2) {

                                        for (let arrItems of find_item_planing) {
                                            for (let itemId of arrItems['items']) {
                                                let obItemId = await items.findOne({ "id": itemId }).exec();
                                                for (let item_user of arritem_user) {
                                                    if (item_user.id.toString() == obItemId._id.toString()) {
                                                        // if (obItemId.type == 'seed') {
                                                        //     if (!flag_seed) {
                                                        //         flag_seed = true;
                                                        //         item_user.quantity = item_user.quantity + 1;
                                                        //     }
                                                        // } else {
                                                        //     item_user.quantity = item_user.quantity + 1;
                                                        // }
                                                        if (obItemId.type.toUpperCase() != 'seed'.toUpperCase()) {
                                                            item_user.quantity = item_user.quantity + 1;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        await users.updateOne(
                                            { eth_address: eth_address },
                                            {
                                                $set: {
                                                    'item': arritem_user
                                                }
                                            }
                                        )
                                    }
                                }
                            }
                        }
                    }
                    delete item._doc._id
                    arr_send.push(item)
                }
            }
            logger.info(`getPlanting by eth_address: ${eth_address}`)
            return res
                .status(200)
                .json({
                    statusCode: "200",
                    message: "successfully",
                    result: arr_send
                });
        } else {
            logger.warn(`getPlanting Get user eth_address : ${eth_address} not foud `);
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
        logger.error(`getPlanting error: ${err}`);
        return res
            .status(500)
            .json({
                statusCode: "500",
                message: "Server error"
            });
    }
}

exports.testPlanting = async (req, res) => {
    try {
        let { eth_address } = req.body;
        let find = await planting.find({ eth_address: eth_address });
        if (find.length > 0) {
            let arr_send = []
            for (let item of find) {
                if (item.is_active) {
                    if (item.is_planting == 'planting') {
                        let cur_phase = item.phase;
                        if (cur_phase != 4) {
                            let next = item.next_phase_datetime;

                            let nextPhase;
                            let alive;
                            let nextDate;
                            let curDate = item.next_phase_datetime;
                            let is_planting = 'planting';
                            switch (cur_phase) {
                                case 1:
                                    alive = generateRandomForPercent(item.survival_chance_phase1);
                                    nextPhase = 2;
                                    nextDate = item.grow_date_phase2;
                                    break;
                                case 2:
                                    alive = generateRandomForPercent(item.survival_chance_phase2);
                                    nextDate = item.grow_date_phase3;
                                    nextPhase = 3;
                                    break;
                                case 3:
                                    alive = generateRandomForPercent(item.survival_chance_phase3);
                                    nextPhase = 4;
                                    break;
                                case 4:
                                    break;
                                default:
                                    alive = false;
                                    nextPhase = null;
                                    break;
                            }
                            if (alive) {
                                console.log("รอด")
                                let objectUpdate = {};
                                var newDateObj = new Date(curDate).addDays(nextDate);
                                if (nextPhase == 2 || nextPhase == 3) {
                                    objectUpdate['phase'] = nextPhase;
                                    objectUpdate['start_phase_datetime'] = item.next_phase_datetime
                                    objectUpdate['next_phase_datetime'] = newDateObj
                                } else if (nextPhase == 4) {
                                    objectUpdate['phase'] = nextPhase;
                                }
                                await planting.updateOne(
                                    {
                                        "_id": ObjectId(item._id)
                                    },
                                    {
                                        $set: objectUpdate
                                    }
                                ).exec();
                                //update date after calculate
                                item['phase'] = nextPhase;
                                item['start_phase_datetime'] = item.next_phase_datetime
                                item['next_phase_datetime'] = newDateObj
                            } else {
                                console.log("ตาย")
                                is_planting = 'failed';
                                await planting.updateOne(
                                    {
                                        "_id": ObjectId(item._id)
                                    },
                                    {
                                        $set: {
                                            is_planting: is_planting,
                                            fail_date: Date.now()
                                        }
                                    }
                                ).exec();

                                //update date after calculate
                                item['is_planting'] = is_planting;
                                let find_user = await users.findOne({ eth_address: eth_address }).exec();
                                let arritem_user = find_user.item;

                                // find_phase = 
                                let find_item_planing
                                switch (cur_phase) {
                                    case 1:
                                        find_item_planing = item['item'].filter(it => {
                                            return it.phase == '2' || it.phase == '3'
                                        });
                                        break;
                                    case 2:
                                        find_item_planing = item['item'].filter(it => {
                                            return it.phase == '3'
                                        });
                                        break;
                                    default:
                                        break;
                                }
                                //update return item to user
                                let flag_seed = false;
                                if (cur_phase == 1 || cur_phase == 2) {
                                    for (let arrItems of find_item_planing) {
                                        for (let itemId of arrItems['items']) {
                                            let obItemId = await items.findOne({ "id": itemId }).exec();
                                            for (let item_user of arritem_user) {
                                                if (item_user.id.toString() == obItemId._id.toString()) {
                                                    if (item_user.id.toString() == obItemId._id.toString()) {
                                                        // if (obItemId.type == 'seed') {
                                                        //     if (!flag_seed) {
                                                        //         flag_seed = true;
                                                        //         item_user.quantity = item_user.quantity + 1;
                                                        //     }
                                                        // } else {
                                                        //     item_user.quantity = item_user.quantity + 1;
                                                        // }
                                                        if (obItemId.type.toUpperCase() != 'seed'.toUpperCase()) {
                                                            item_user.quantity = item_user.quantity + 1;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    await users.updateOne(
                                        { eth_address: eth_address },
                                        {
                                            $set: {
                                                'item': arritem_user
                                            }
                                        }
                                    )
                                }
                            }

                        }
                    }
                    delete item._doc._id
                    arr_send.push(item)
                }
            }
            logger.info(`getPlanting by eth_address: ${eth_address}`)
            return res
                .status(200)
                .json({
                    statusCode: "200",
                    message: "successfully",
                    result: arr_send
                });
        } else {
            logger.warn(`getPlanting Get user eth_address : ${eth_address} not foud `);
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
        logger.error(`getPlanting error: ${err}`);
        return res
            .status(500)
            .json({
                statusCode: "500",
                message: "Server error"
            });
    }
}


function generateRandomInteger(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1))
}

function generateRandomForPercent(p) {
    return Math.random() < (p / 100)
}

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function addMinutes(oldDate, minutes) {
    return new Date(oldDate.getTime() + minutes * 60000)
}