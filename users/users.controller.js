var users = require('../model/users.model');
exports.getUser = async (req, res, next) => {
    try {
        let find = await users.find({},{ _id: 0 }).exec();
        return res
            .status(200)
            .json({
                statusCode: "200",
                message: "successfully 😊 👌",
                result: find
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
