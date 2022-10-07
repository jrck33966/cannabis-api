const jwt = require("jsonwebtoken");
var users = require('../model/users.model');
var ObjectId = require('mongoose').Types.ObjectId;
var config = require('../config/config')
const bcrypt = require('bcrypt');

const authorization = async (req, res, next) => {
    const bearerHeader = req.headers['authentication'];
    if (!bearerHeader) {
        return res.status(401)
            .json({ message: "Unauthorization" });
    }
    try {
        let bearer = bearerHeader.split(' ');
        let token = bearer[1];
        if (!token) {
            return res.status(401)
                .json({ message: "Unauthorization" });
        }
        jwt.verify(token, config.jwtSecretAdmin, async (err, data) => {
            if (err) {
                try {
                    let ag_data = jwt.verify(token, config.jwtSecret);      
                    let exp = ag_data.exp;
                    if (Date.now() >= exp * 1000) {
                        return res.status(401)
                        .json({ message: "Unauthorization" });
                    }
                    let find = await users.findOne({ id: ObjectId(ag_data.id) }).exec();               
                    if (!find) {
                        return res.status(401)
                            .json({ message: "Unauthorization" });
                    }
                    req.userId = ag_data.id;
                    return next();
                } catch {
                    return res.status(401)
                        .json({ message: "Unauthorization" });
                }

            } else {
                let r = await bcrypt.compare('dev', data.id)
                if (!r) {
                    return res.status(401)
                        .json({ message: "Unauthorization" });
                }
                let exp = data.exp;
                if (Date.now() >= exp * 1000) {
                    return res.status(401)
                    .json({ message: "Unauthorization" });
                }
                return next();
            }
        });
    } catch (e) {
        return res.status(401)
            .json({ message: "Unauthorization" });
    }
};

module.exports = authorization