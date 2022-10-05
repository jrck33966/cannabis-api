const jwt = require("jsonwebtoken");
var users = require('../model/users.model');
var ObjectId = require('mongoose').Types.ObjectId;
var config = require('../config/config')

const authorization = async (req, res, next) => {
    const token = req.cookies.uuid;
    if (!token) {
        try {
            const gdid = req.cookies.gdid;
            if (gdid) {
                const data_dg = jwt.verify(gdid, config.jwtSecretAdmin);
                if (data_dg.role != "god") {
                    return res.status(401)
                        .json({ message: "Unauthorization" });
                }
                return next();
            }
            return res.status(401)
                .json({ message: "Unauthorization" });
        } catch (e) {
            console.log(e)
        }
    }
    try {
        const data = jwt.verify(token, config.jwtSecret);
        let find = await users.findOne({ id: ObjectId(data.id) }).exec()
        if (!find) {
            return res.status(401)
                .json({ message: "Unauthorization" });
        }
        req.userId = data.id;
        return next();
    } catch {
        return res.status(401)
            .json({ message: "Unauthorization" });;
    }
};

module.exports = authorization