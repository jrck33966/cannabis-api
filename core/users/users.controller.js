var users = require('../../model/users.model');
var ObjectId = require('mongoose').Types.ObjectId;
var moment = require('moment');

exports.getUser = async (req, res, next) => {
    try {
        const query = req.query;
        let page = query.page;
        let limit = query.limit;

        if ((page == undefined || page == '') && (limit == undefined || limit == '')) {
            let find = await users.find({}, { _id: 0 }).exec();
            return res
                .status(200)
                .json({
                    statusCode: "200",
                    message: "successfully",
                    result: find
                });
        } else {
            limit = limit || 10
            let find = await users.find({}, { _id: 0 })
                .skip(calSkip(page, limit))
                .limit(limit)
                .exec();

            const count = await users.countDocuments().exec()

            return res
                .status(200)
                .json({
                    statusCode: "200",
                    message: "successfully 😊 👌",
                    currentPage: page,
                    pages: calPage(count, limit),
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

exports.editUser = async (req, res, next) => {
    try {
        const { eth_address, attribute } = req.body;
        let find = await users.findOne({ eth_address: eth_address }).exec();
        if (!find) {
            return res
                .status(404)
                .json({
                    statusCode: "404",
                    message: `User not foud.`
                });
        }

        let new_attribute = attribute;
        let r = users.updateOne(
            { "_id": ObjectId(find._id) },
            {
                $set: {
                    attribute: new_attribute,
                    lastUpdate: Date.now()
                    // lastUpdate : moment(Date.now()).format('YYYYMMDDHHmmssZZ') 
                }
            }
        ).exec();

        return res
            .status(200)
            .json({
                statusCode: "200",
                message: "Edit user successfully 😊 👌",
                result: r
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


const calSkip = (page, size) => {
    return (page - 1) * size;
};

const calPage = (count, size) => {
    return Math.ceil(count / size);
};
