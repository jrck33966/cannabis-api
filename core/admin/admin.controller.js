let ms = require('ms');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");
const bcrypt = require('bcrypt');
let admin_token = require('../../model/adminToken.model')
var logger = require('../../config/configLog')

exports.adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (username == undefined || username == "") {
            logger.warn('adminLogin ValidationError: username: Path `username` is required.')
            return res
                .status(400)
                .json({
                    message: "err : ValidationError: username: Path `username` is required.",
                    statusCode: "400",
                });
        }

        if (password == undefined || password == "") {
            logger.warn('adminLogin ValidationError: password: Path `password` is required.')
            return res
                .status(400)
                .json({
                    message: "err : ValidationError: password: Path `password` is required.",
                    statusCode: "400",
                });
        }
        if (username != "dev" || password != "dev") {
            logger.warn('adminLogin Password is mismatch')
            return res
                .status(400)
                .json({
                    message: "Password is mismatch",
                    statusCode: "400",
                });
        }
        const exp = '2h';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(`${username}`, salt);
        const token = jwt.sign(
            { id: hash, role: "god" },
            config.jwtSecretAdmin,
            { expiresIn: exp, algorithm: 'HS384' }
        );

        let newAdmtoken = new admin_token();
        newAdmtoken.token = token;
        newAdmtoken.expiresIn = Date.now() + ms(exp);
        newAdmtoken.revoke = false;
        newAdmtoken.save();
        // var dayInMilliseconds = 1000 * 60 * 60 * 24;
        // var dayInMilliseconds = 1000 * 10;
        // const expires = new Date(Number(new Date()) + dayInMilliseconds);
        logger.info(`adminLogin success by username: ${username}`)
        return res
            // .cookie("gdid", token, {
            //     httpOnly: true,
            //     secure: true,
            //     expires: exp,
            //     sameSite: 'None'         
            // })
            .status(200)
            .json({
                message: "Login in successfully 😊 👌",
                statusCode: "200",
                result: {
                    token: token
                }
            });
    } catch (err) {
        logger.error(`adminLogin error: ${err}`);
        return res
            .status(500)
            .json({
                message: "Server error",
                statusCode: "500",
            })
    }

};

exports.adminlogout = (req, res) => {
    try {
        let token = req.token;
        admin_token.updateOne(
            { "token": token },
            {
                $set: { "revoke": true }
            }
        ).exec();
        logger.info(`adminLogout success by username: ${req.id}`)
        return res
            .clearCookie("gdid")
            .status(200)
            .json({ message: "Successfully logged out 😏 🍀" });
    } catch (err) {
        logger.error(`adminlogout error: ${err}`);
        return res
            .status(500)
            .json({
                message: "Server error",
                statusCode: "500",
            })
    }

};