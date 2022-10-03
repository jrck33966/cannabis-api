const jwt = require("jsonwebtoken");
var users = require('../model/users.model');
var ObjectId = require('mongoose').Types.ObjectId;
const authorization = async (req, res, next) => {
    const token = req.cookies.uuid;
    if (!token) {
        return res.status(403)
            .json({ message: "Unauthorization" });
    }
    try {
        const data = jwt.verify(token, "cain");
        let find = await users.findOne({ id: ObjectId(data.id) }).exec()
        if (!find) {
            return res.status(403)
                .json({ message: "Unauthorization" });
        }
        req.userId = data.id;
        return next();
    } catch {
        return res.status(403)
            .json({ message: "Unauthorization" });;
    }
};

module.exports = authorization