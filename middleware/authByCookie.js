const jwt = require("jsonwebtoken");
var users = require('../model/users.model');
var ObjectId = require('mongoose').Types.ObjectId;
var config = require('../config/config')
const bcrypt = require('bcrypt');

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
                let r = await bcrypt.compare('dev', data_dg.id)
                if(!r){
                    return res.status(401)
                    .json({ message: "Unauthorization" });
                }
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(`dev`, salt);
                const token = jwt.sign({ id:hash, role: "god" }, config.jwtSecretAdmin);
                var dayInMilliseconds = 1000 * 60 * 60 * 24;
                let exp = new Date(Number(new Date()) + dayInMilliseconds);
                res
                .cookie("gdid", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    expires: exp
                })
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