const jwt = require("jsonwebtoken");
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
        const data = jwt.verify(token, config.jwtSecretAdmin);
        if (data.role != "god") {
            return res.status(401)
                .json({ message: "Unauthorization" });
        }
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
    } catch {
        return res.status(401)
            .json({ message: "Unauthorization" });;
    }
};

module.exports = authorization