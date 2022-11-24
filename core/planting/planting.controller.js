var ObjectId = require('mongoose').Types.ObjectId;
var moment = require('moment');
var logger = require('../../config/configLog')
var _ = require('underscore');

var planting = require('../../model/planting.model');
var users = require('../../model/users.model');
var items = require('../../model/items.model')
var landStat = require('../../model/land_stat.model')

exports.startPlanting = async (req, res) => {
    try {
        let { eth_address, seed_id, land_id, special_id, item_list } = req.body;
        //cut the number of item user
        let user_find = await users.findOne({ eth_address, eth_address }).exec();
        if (!user_find) {
            logger.warn(`getPlanting Get user eth_address : ${eth_address} not foud `);
            return res
                .status(404)
                .json({
                    statusCode: "404",
                    message: "Get user not foud"
                });
        }
        if (!land_id) {
            logger.warn(`getPlanting user eth_address : ${eth_address} land_id:${land_id} is null`);
            return res
                .status(400)
                .json({
                    statusCode: "400",
                    message: "err : ValidationError: land_id: Path `land_id` is required.",
                });
        }
        if (user_find['item'].length <= 0) {
            logger.warn(`getPlanting user eth_address : ${eth_address} has no item.`);
            return res
                .status(400)
                .json({
                    statusCode: "400",
                    message: `ERROR : user eth_address : ${eth_address} has no item.`,
                });
        }
        let user_player_land = user_find['player_land'].find(it => it.land_id == land_id);
        if (!user_player_land) {
            logger.warn(`getPlanting user eth_address : ${eth_address} has no land item.`);
            return res
                .status(400)
                .json({
                    statusCode: "400",
                    message: `ERROR : user eth_address : ${eth_address} has no land item.`,
                });
        }
        let rarity = user_player_land.meta_data.attributes.rarity;
        let format = user_player_land.meta_data.attributes.format;
        let land_stat_find = await landStat.findOne({ rarity: rarity, format: format }).exec();

        let flag_seed = false;
        let flag_error = false;
        let msg_error = [];


        /// check user player land
        if (user_player_land) {
            // ลบ land ออก เนื่องจากมีการใช้ land นั้น
            user_find['player_land'].map(it => {
                if (it.land_id == land_id) {
                    if (it.meta_data.attributes.amount >= 1) {
                        it.meta_data.attributes.amount = (parseInt(it.meta_data.attributes.amount) - 1).toString();
                    } else {
                        flag_error = true;
                        msg_error.push({
                            type: "land",
                            name: it.meta_data.name
                        })
                    }
                }
            })
        }



        /// check item user (seed)
        let find_item_seed = await items.findOne({ "id": seed_id }).exec();
        if (find_item_seed) {
            // ตรวจสอบว่า user มี seed ที่ส่งมาไหม
            let checkSeed = user_find['item'].find(it => it.id.toString() == find_item_seed._id.toString())
            if (!checkSeed) {
                flag_error = true;
                msg_error.push({
                    type: find_item_seed.type,
                    name: find_item_seed.name
                })
            }
            // ลบ seed ออก เนื่องจากมีการใช้ seed นั้น
            user_find['item'].map(it => {
                if (it.id.toString() == find_item_seed._id.toString()) {
                    if (it.quantity >= 1) {
                        it.quantity = it.quantity - 1;
                    } else {
                        flag_error = true;
                        msg_error.push({
                            type: find_item_seed.type,
                            name: find_item_seed.name
                        })
                    }
                }
            })
        }

        /// check item user
        for (let item of item_list) {
            for (let itemId of item['items']) {
                let find_item = await items.findOne({ "id": itemId }).exec();
                for (let item_user of user_find['item']) {
                    if (item_user.id.toString() == find_item._id.toString()) {
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
                    'item': user_find['item'],
                    'player_land': user_find['player_land']
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
                    let grow_date_phase1 = await PlantingFormulaGrowDatePhase_1(land_stat_find,
                        seed_id,
                        special_id,
                        item_list

                    )
                    let survival_chance_phase1 = await PlantingFormulaSurvivePhase_1(land_stat_find,
                        seed_id,
                        special_id,
                        item_list

                    )
                    plantingModel.next_phase_datetime = new Date().addDays(grow_date_phase1);
                    plantingModel.grow_date_phase1 = grow_date_phase1
                    plantingModel.survival_chance_phase1 = survival_chance_phase1;
                    break;
                case "2":
                    let grow_date_phase2 = await PlantingFormulaGrowDatePhase_2(land_stat_find,
                        seed_id,
                        special_id,
                        item_list

                    )
                    let survival_chance_phase2 = await PlantingFormulaSurvivePhase_2(land_stat_find,
                        seed_id,
                        special_id,
                        item_list

                    )
                    plantingModel.grow_date_phase2 = grow_date_phase2;
                    plantingModel.survival_chance_phase2 = survival_chance_phase2;
                    break;
                case "3":
                    let grow_date_phase3 = await PlantingFormulaGrowDatePhase_3(land_stat_find,
                        seed_id,
                        special_id,
                        item_list

                    )
                    let survival_chance_phase3 = await PlantingFormulaSurvivePhase_3(land_stat_find,
                        seed_id,
                        special_id,
                        item_list

                    )
                    plantingModel.grow_date_phase3 = grow_date_phase3;
                    plantingModel.survival_chance_phase3 = survival_chance_phase3;
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
        let find = await planting.find({ eth_address: eth_address, is_active: true });
        if (find.length > 0) {
            let arr_send = []
            for (let item of find) {
                let checkDate = false;
                do {
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
                                    checkDate = true;
                                }
                            } else {
                                checkDate = true;
                                console.log("ยังไม่ถึงเวลา")
                            }
                        } else if (cur_phase == 4) {
                            checkDate = true;
                        }
                    } else {
                        checkDate = true;
                    }
                } while (!checkDate)
                item['_doc']['timeserver'] = moment(Date.now()).format('YYYYMMDDHHmmssZZ')
                delete item._doc._id;
                arr_send.push(item)
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

exports.getPlantingCheckDate = async (req, res) => {
    try {
        let { eth_address } = req.body;
        let find = await planting.find({ eth_address: eth_address, is_active: true });
        if (find.length > 0) {
            let arr_send = []
            for (let item of find) {
                let checkDate = false;
                do {
                    if (item.is_planting == 'planting') {
                        let next = item.next_phase_datetime;
                        let cur_phase = item.phase;
                        if (cur_phase != 4) {
                            if (moment(Date.now()).format('YYYYMMDDHHmmssZZ') > moment(next).format('YYYYMMDDHHmmssZZ')) {
                                let objectUpdate = {};
                                let curDate = item.next_phase_datetime;
                                var newDateObj = new Date(curDate).addDays(1);
                                objectUpdate['next_phase_datetime'] = newDateObj
                                await planting.updateOne(
                                    {
                                        "_id": ObjectId(item._id)
                                    },
                                    {
                                        $set: objectUpdate
                                    }
                                ).exec();
                                item['next_phase_datetime'] = objectUpdate['next_phase_datetime'];
                                next = objectUpdate['next_phase_datetime'];

                                console.log(newDateObj)
                            } else {
                                checkDate = true;
                                console.log("ยังไม่ถึงเวลา")
                            }
                        }
                    }
                } while (!checkDate)
                delete item._doc._id
                arr_send.push(item)
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
        let find = await planting.find({ eth_address: eth_address, is_active: true });
        if (find.length > 0) {
            let arr_send = []
            for (let item of find) {
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

exports.testPlantingByDate = async (req, res) => {
    try {
        let { eth_address, date } = req.body;
        if (!date) {
            return res
                .status(400)
                .json({
                    message: "err : ValidationError: date: Path `date` is required.",
                    statusCode: "400",
                });
        }
        let find = await planting.find({ eth_address: eth_address, is_active: true });
        if (find.length > 0) {
            let arr_send = []
            for (let item of find) {
                let checkDate = false;
                do {
                    if (item.is_planting == 'planting') {
                        let next = item.next_phase_datetime;
                        let cur_phase = item.phase;
                        if (cur_phase != 4) {
                            if (moment(date).format('YYYYMMDDHHmmssZZ') > moment(next).format('YYYYMMDDHHmmssZZ')) {
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
                                    checkDate = true;
                                }
                            } else {
                                checkDate = true;
                                console.log("ยังไม่ถึงเวลา")
                            }
                        } else if (cur_phase == 4) {
                            checkDate = true;
                        }
                    } else {
                        checkDate = true;
                    }
                } while (!checkDate)
                item['_doc']['timeserver'] = moment(Date.now()).format('YYYYMMDDHHmmssZZ')
                delete item._doc._id;
                arr_send.push(item)
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


async function PlantingFormulaGrowDatePhase_1(landStat, seedId, specialId, itemlist) {
    let landStat_GrowDataBouns = landStat.grow_date_bonus

    let seed = await findItem(seedId, "seed")
    let seed_GrowDateBouns = seed ? seed.attribute.grow_date.p1 : 0;

    let special = await findItem(specialId, "special")
    let special_GrowDateBouns = special ? special.attribute.grow_date_bonus : 0;

    let item_GrowDateBouns = 0;
    for (let item of itemlist) {
        if (item.phase == "1") {
            for (let itemId of item['items']) {
                let itemObject = await findItem(itemId, null);
                item_GrowDateBouns += itemObject ? itemObject.attribute.grow_date_bonus : 0;
            }
        }
    }

    return landStat_GrowDataBouns + seed_GrowDateBouns + special_GrowDateBouns + item_GrowDateBouns;
}

async function PlantingFormulaGrowDatePhase_2(landStat, seedId, specialId, itemlist) {
    let landStat_GrowDataBouns = landStat.grow_date_bonus

    let seed = await findItem(seedId, "seed")
    let seed_GrowDateBouns = seed ? seed.attribute.grow_date.p2 : 0;

    let special = await findItem(specialId, "special")
    let special_GrowDateBouns = special ? special.attribute.grow_date_bonus : 0;

    let item_GrowDateBouns = 0;
    for (let item of itemlist) {
        if (item.phase == "2") {
            for (let itemId of item['items']) {
                let itemObject = await findItem(itemId, null);
                item_GrowDateBouns += itemObject ? itemObject.attribute.grow_date_bonus : 0;
            }
        }
    }

    return landStat_GrowDataBouns + seed_GrowDateBouns + special_GrowDateBouns + item_GrowDateBouns;
}

async function PlantingFormulaGrowDatePhase_3(landStat, seedId, specialId, itemlist) {
    let landStat_GrowDataBouns = landStat.grow_date_bonus

    let seed = await findItem(seedId, "seed")
    let seed_GrowDateBouns = seed ? seed.attribute.grow_date.p3 : 0;

    let special = await findItem(specialId, "special")
    let special_GrowDateBouns = special ? special.attribute.grow_date_bonus : 0;

    let item_GrowDateBouns = 0;
    for (let item of itemlist) {
        if (item.phase == "3") {
            for (let itemId of item['items']) {
                let itemObject = await findItem(itemId, null);
                item_GrowDateBouns += itemObject ? itemObject.attribute.grow_date_bonus : 0;
            }
        }
    }

    return landStat_GrowDataBouns + seed_GrowDateBouns + special_GrowDateBouns + item_GrowDateBouns;
}


async function PlantingFormulaSurvivePhase_1(landStat, seedId, specialId, itemlist) {
    let landStat_SurviveRateBouns = landStat.survive_rate_bonus

    let seed = await findItem(seedId, "seed")
    let seed_SurviveRateBouns = seed ? seed.attribute.survive_rate_phase.p1 : 0;

    let special = await findItem(specialId, "special")
    let special_SurviveRateBouns = special ? special.attribute.survive_rate_bonus : 0;

    let item_SurviveRateBouns = 0;
    for (let item of itemlist) {
        if (item.phase == "1") {
            for (let itemId of item['items']) {
                let itemObject = await findItem(itemId, null);
                item_SurviveRateBouns += itemObject ? itemObject.attribute.survive_rate_bonus : 0;
            }
        }
    }

    return landStat_SurviveRateBouns + seed_SurviveRateBouns + special_SurviveRateBouns + item_SurviveRateBouns;
}

async function PlantingFormulaSurvivePhase_2(landStat, seedId, specialId, itemlist) {
    let landStat_SurviveRateBouns = landStat.survive_rate_bonus

    let seed = await findItem(seedId, "seed")
    let seed_SurviveRateBouns = seed ? seed.attribute.survive_rate_phase.p2 : 0;

    let special = await findItem(specialId, "special")
    let special_SurviveRateBouns = special ? special.attribute.survive_rate_bonus : 0;

    let item_SurviveRateBouns = 0;
    for (let item of itemlist) {
        if (item.phase == "2") {
            for (let itemId of item['items']) {
                let itemObject = await findItem(itemId, null);
                item_SurviveRateBouns += itemObject ? itemObject.attribute.survive_rate_bonus : 0;
            }
        }
    }

    return landStat_SurviveRateBouns + seed_SurviveRateBouns + special_SurviveRateBouns + item_SurviveRateBouns;
}

async function PlantingFormulaSurvivePhase_3(landStat, seedId, specialId, itemlist) {
    let landStat_SurviveRateBouns = landStat.survive_rate_bonus

    let seed = await findItem(seedId, "seed")
    let seed_SurviveRateBouns = seed ? seed.attribute.survive_rate_phase.p3 : 0;

    let special = await findItem(specialId, "special")
    let special_SurviveRateBouns = special ? special.attribute.survive_rate_bonus : 0;

    let item_SurviveRateBouns = 0;
    for (let item of itemlist) {
        if (item.phase == "3") {
            for (let itemId of item['items']) {
                let itemObject = await findItem(itemId, null);
                item_SurviveRateBouns += itemObject ? itemObject.attribute.survive_rate_bonus : 0;
            }
        }
    }

    return landStat_SurviveRateBouns + seed_SurviveRateBouns + special_SurviveRateBouns + item_SurviveRateBouns;
}




async function findItem(itemId, type) {
    if (type) {
        let typeUpper = new RegExp(["^", type, "$"].join(""), "i");
        return await items.findOne({ id: itemId, type: typeUpper }, { _id: 0 }).exec();
    }
    return await items.findOne({ id: itemId }, { _id: 0 }).exec();
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