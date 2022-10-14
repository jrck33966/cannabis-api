var planting = require('../../model/planting.model');
var ObjectId = require('mongoose').Types.ObjectId;
var moment = require('moment');
var logger = require('../../config/configLog')

exports.startPlanting = async (req, res) => {
    try {
        let { eth_address, item_list } = req.body;
        let find = await planting.findOne({ eth_address: eth_address }).exec();
        if (find) {
            let itemPlanting = find.item;
            for (let item of item_list) {
                switch (item.phase) {
                    case "1":
                        itemPlanting = itemPlanting.filter(it => it.phase != "1");
                        itemPlanting.push(item)
                        break;
                    case "2":
                        itemPlanting = itemPlanting.filter(it => it.phase != "2");
                        itemPlanting.push(item)
                        break;
                    case "3":
                        itemPlanting = itemPlanting.filter(it => it.phase != "3");
                        itemPlanting.push(item)
                        break;
                    default:
                        console.log("phase not found")
                        break;
                }
            }
            await planting.updateOne(
                {
                    "_id": ObjectId(find._id)
                },
                {
                    $set: {
                        item: itemPlanting
                    }
                }
            ).exec();
            logger.info(`startPlanting success by eth_address: ${eth_address}`)
            return res
                .status(200)
                .json({
                    statusCode: "200",
                    message: "successfully 😊 👌"
                });
        } else {
            let plantingModel = new planting();
            plantingModel.eth_address = eth_address;
            plantingModel.item = item_list;
            plantingModel.phase = 1;
            plantingModel.start_phase_datetime = Date.now();
            // plantingModel.next_phase_datetime = new Date().addDays(1);
            for (let item of item_list) {
                switch (item.phase) {
                    case "1":
                        plantingModel.next_phase_datetime = new Date().addDays(1);
                        plantingModel.grow_date_phase1 = 1;
                        plantingModel.survival_chance_phase1 = generateRandomInteger(60, 70);
                        break;
                    case "2":
                        plantingModel.grow_date_phase2 = 2;
                        plantingModel.survival_chance_phase2 = generateRandomInteger(50, 60);
                        break;
                    case "3":
                        plantingModel.grow_date_phase3 = 3;
                        plantingModel.survival_chance_phase3 = generateRandomInteger(40, 50);
                        break;
                    default:
                        console.log("phase not found")
                        break;
                }
            }
            plantingModel.female_chance = generateRandomInteger(1, 100);
            plantingModel.production_quality = generateRandomInteger(1, 100);
            plantingModel.is_planting = true;
            await planting.create(plantingModel);
            logger.info(`startPlanting success by eth_address: ${eth_address}`)
            return res
                .status(200)
                .json({
                    statusCode: "200",
                    message: "successfully"
                });
        }
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
        let find = await planting.findOne({ eth_address: eth_address });
        if (find) {
            if (find.is_planting) {
                let next = find.next_phase_datetime;
                let cur_phase = find.phase;
                if (moment(Date.now()).format('YYYYMMDDHHmmssZZ') > moment(next).format('YYYYMMDDHHmmssZZ')) {
                    let nextPhase;
                    let alive;
                    let nextDate;
                    let curDate = find.next_phase_datetime;
                    let is_planting = true;
                    switch (cur_phase) {
                        case 1:
                            alive = generateRandomForPercent(find.survival_chance_phase1);
                            nextPhase = 2;
                            nextDate = find.grow_date_phase2;
                            break;
                        case 2:
                            alive = generateRandomForPercent(find.survival_chance_phase2);
                            nextDate = find.grow_date_phase3;
                            nextPhase = 3;
                            break;
                        case 3:
                            alive = generateRandomForPercent(find.survival_chance_phase3);
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
                            objectUpdate['start_phase_datetime'] = find.next_phase_datetime
                            objectUpdate['next_phase_datetime'] = newDateObj
                        } else if (nextPhase == 4) {
                            objectUpdate['phase'] = nextPhase;
                        }
                        await planting.updateOne(
                            {
                                "_id": ObjectId(find._id)
                            },
                            {
                                $set: objectUpdate
                            }
                        ).exec();
                        //update date after calculate
                        find['phase'] = nextPhase;
                        find['start_phase_datetime'] = find.next_phase_datetime
                        find['next_phase_datetime'] = newDateObj
                    } else {
                        console.log("ตาย")
                        is_planting = false;
                        await planting.updateOne(
                            {
                                "_id": ObjectId(find._id)
                            },
                            {
                                $set: {
                                    is_planting: is_planting
                                }
                            }
                        ).exec();
                        //update date after calculate
                        find['is_planting'] = is_planting;
                    }
                } else {
                    console.log("ยังไม่ถึงเวลา")
                }
                logger.info(`getPlanting phase:${cur_phase} status:${typeof alive === 'undefined' ?
                    find.is_planting ? 'alive' : 'dead' :
                    alive ? 'alive' : 'dead'} by eth_address: ${eth_address}`)
                return res
                    .status(200)
                    .json({
                        statusCode: "200",
                        message: "successfully",
                        result: find
                    });
            } else {
                return res
                    .status(200)
                    .json({
                        statusCode: "200",
                        message: "successfully",
                        result: `planting don't survive.`
                    });
            }

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
        let find = await planting.findOne({ eth_address: eth_address });
        if (find) {
            if (find.is_planting) {
                let cur_phase = find.phase;
                let nextPhase;
                let alive;
                let nextDate;
                let curDate = find.next_phase_datetime;
                let is_planting = true;
                switch (cur_phase) {
                    case 1:
                        alive = generateRandomForPercent(find.survival_chance_phase1);
                        nextPhase = 2;
                        nextDate = find.grow_date_phase2;
                        break;
                    case 2:
                        alive = generateRandomForPercent(find.survival_chance_phase2);
                        nextDate = find.grow_date_phase3;
                        nextPhase = 3;
                        break;
                    case 3:
                        alive = generateRandomForPercent(find.survival_chance_phase3);
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
                        objectUpdate['start_phase_datetime'] = find.next_phase_datetime
                        objectUpdate['next_phase_datetime'] = newDateObj
                    } else if (nextPhase == 4) {
                        objectUpdate['phase'] = nextPhase;
                    }
                    await planting.updateOne(
                        {
                            "_id": ObjectId(find._id)
                        },
                        {
                            $set: objectUpdate

                        }
                    ).exec();
                    //update date after calculate
                    find['phase'] = nextPhase;
                    find['start_phase_datetime'] = find.next_phase_datetime
                    find['next_phase_datetime'] = newDateObj
                } else {
                    console.log("ตาย")
                    is_planting = false;
                    await planting.updateOne(
                        {
                            "_id": ObjectId(find._id)
                        },
                        {
                            $set: {
                                is_planting: is_planting
                            }
                        }
                    ).exec();
                    //update date after calculate
                    find['is_planting'] = is_planting;
                }
                logger.info(`getPlanting phase:${cur_phase} status:${alive ? 'alive' : 'dead'} by eth_address: ${eth_address}`)
                return res
                    .status(200)
                    .json({
                        statusCode: "200",
                        message: "successfully",
                        result: find
                    });
            } else {
                return res
                    .status(200)
                    .json({
                        statusCode: "200",
                        message: "successfully",
                        result: `planting don't survive.`
                    });
            }

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