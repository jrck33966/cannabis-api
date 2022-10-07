const jwt = require("jsonwebtoken");
var config = require('../config/config')
const bcrypt = require('bcrypt');

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
        let r = await bcrypt.compare('dev', data.id)           
        if(!r){
            return res.status(401)
            .json({ message: "Unauthorization" });
        }
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(`${data.id}`, salt);
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
    } catch {
        return res.status(401)
            .json({ message: "Unauthorization" });;
    }
};

module.exports = authorization