const jwt = require("jsonwebtoken");
var users = require('../model/users.model');
var ObjectId = require('mongoose').Types.ObjectId;
var config = require('../config/config')

const authorization = async (req, res, next) => {
    const token = req.cookies.gdid;
    if (!token) {
        return res.status(401)
            .json({ message: "Unauthorization" });
    }
    try {
        const data = jwt.verify(token,config.jwtSecretAdmin);
        if(data.role != "god"){
            return res.status(401)
            .json({ message: "Unauthorization" });
        }
        return next();
    } catch {
        return res.status(401)
            .json({ message: "Unauthorization" });;
    }
};

module.exports = authorization