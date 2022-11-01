const moment = require('moment');
const config = require("../../config/config");
const income = require('../../model/income.model');
const items = require('../../model/items.model');
const logger = require('../../config/configLog');
const ObjectId = require('mongoose').Types.ObjectId;

exports.getByDay = async (req, res) => {
    try {
        const { date } = req.body;
        let strDate = date;
        let strDate_split = strDate.split("+")
        strDate_split = strDate_split[0].substring(0, 8)
        let startDate = moment(strDate, "YYYYMMDDHHmmssZZ")
        let endDate = moment(`${strDate_split}235959+0700`, "YYYYMMDDHHmmssZZ")
        let find_income = await income.aggregate([
            {
                $match: {
                    buy_date: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },
            {
                $lookup:
                {
                    from: "cannabis_items",
                    localField: "itemId",
                    foreignField: "id",
                    as: "itemData"
                }
            },
            { $unwind: "$itemData" },
            {
                $addFields: { itemName: "$itemData.name" }
            },
            { $project: { itemData: 0 } }
        ]).exec();
        let result = {};
        let eth_distinct = [...new Set(find_income.map(item => item.eth_address))];
        let userArray = [];
        let sumAllPrice = 0;

        for (let etha of eth_distinct) {
            let userObject = {
                eth_address: etha,
                items: []
            }
            let filter_income = find_income.filter(val => {
                return val.eth_address == etha;
            })
            let tmpItemId = []
            for (let income of filter_income) {
                tmpItemId.push(income.itemId);
            }
            let itemId_distinct = [...new Set(tmpItemId.map(id => id))];
            for (let itemId of itemId_distinct) {
                let filter_income_byItemID = filter_income.filter(val => { return val.itemId == itemId })
                let itemObject = {
                    itemId: itemId,
                    itemName: find_income.find(val => val.itemId == itemId).itemName,
                    total_price: 0
                };
                for (let income of filter_income_byItemID) {
                    itemObject.total_price += income.total_price;
                    sumAllPrice += income.total_price;
                }
                userObject.items.push(itemObject)
            }
            userArray.push(userObject);
        }
        result['sum_price'] = sumAllPrice;
        result['users'] = userArray;
        logger.info(`getReporting date:${startDate}`)
        return res
            .status(200)
            .json({
                message: "get reporting",
                result: result
            });
    } catch (err) {
        logger.error(`reporting error: ${err}`);
        return res
            .status(500)
            .json({
                message: "Server error",
                statusCode: "500",
            })
    }

};

exports.getByMonth = async (req, res) => {
    try {
        const { month, year } = req.body;

        if (month == undefined) {
            return res
                .status(400)
                .json({
                    statusCode: "400",
                    message: "err : ValidationError: month: Path `month` is required.",
                });

        }
        if (year == undefined) {
            return res
                .status(400)
                .json({
                    statusCode: "400",
                    message: "err : ValidationError: year: Path `year` is required.",
                });
        }

        if (month > 12 || month < 1 || month.toString().length > 2) {
            return res
                .status(400)
                .json({
                    statusCode: "400",
                    message: "month invalid."
                });
        }

        let result = {}
        var nameMonth = ['January', 'February', 'March',
            'April', 'May', 'June',
            'July', 'August', 'September',
            'October', 'November', 'December'];
        let numberOfDays = daysInMonth(month, year)
        let data = []
        let find_income = await income.aggregate(
            [
                {
                    $project:
                    {
                        doc: "$$ROOT",
                        year: { $year: "$buy_date" },
                        month: { $month: "$buy_date" },
                        day: { $dayOfMonth: "$buy_date" }
                    }
                },
                { $match: { "month": month, "year": year } },
                {
                    $replaceRoot: {
                        newRoot: "$doc"
                    }
                },
                {
                    $addFields: { day: { $dayOfMonth: { date: "$buy_date", timezone: "+0700" } } }
                }
            ]
        )
        for (let i = 0; i < numberOfDays; i++) {
            let filter_income = find_income.filter(val => {
                return val.day == i + 1;
            })
            let price = 0;
            for (let income of filter_income) {
                price += income.total_price;
            }
            let ob = {
                day: i + 1,
                total_price: price
            }
            data.push(ob);
        }
        result['month'] = nameMonth[month - 1];
        result['data'] = data;
        return res
            .status(200)
            .json({
                message: "get reporting",
                result: data
            });
    } catch (err) {
        logger.error(`reporting error: ${err}`);
        return res
            .status(500)
            .json({
                message: "Server error",
                statusCode: "500",
            })
    }
}


exports.getTest = async (req, res) => {
    try {
        let strDate = "20221026000000+0700";
        let strDate_split = strDate.split("+")
        strDate_split = strDate_split[0].substring(0, 8)
        let startDate = moment(strDate, "YYYYMMDDHHmmssZZ")
        let endDate = moment(`${strDate_split}235959+0700`, "YYYYMMDDHHmmssZZ")
        let find_income = await income.aggregate([
            {
                $match: {
                    buy_date: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            }

        ]).exec();
        // let find_income = await income.find({
        //     buy_date: {
        //         $gte: startDate,
        //         $lt: endDate
        //     }
        // }).exec();
        return res
            .status(200)
            .json({
                message: "get reporting",
                result: find_income
            });
    } catch (err) {
        logger.error(`reporting error: ${err}`);
        return res
            .status(500)
            .json({
                message: "Server error",
                statusCode: "500",
            })
    }

};

function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}


