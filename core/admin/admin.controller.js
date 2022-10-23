let ms = require('ms');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");
const bcrypt = require('bcrypt');
let admin_token = require('../../model/adminToken.model')
var logger = require('../../config/configLog')
var ObjectId = require('mongoose').Types.ObjectId;

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
        if (username != config.admin.username || password != config.admin.password) {
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

        const refresh_token = jwt.sign(
            { token: token },
            config.jwtRefreshSecretAdmin,
            { expiresIn: exp, algorithm: 'HS384' }
        );

        let newAdmtoken = new admin_token();
        newAdmtoken.token = token;
        newAdmtoken.refresh_token = refresh_token;
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
                    token: token,
                    refresh_token: refresh_token
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

exports.refreshToken = (req, res) => {
    try {
        let { refresh_token } = req.body;
        jwt.verify(refresh_token, config.jwtRefreshSecretAdmin, async (err, decoded) => {
            if (err) {
                return res.status(401)
                    .json({ message: "Unauthorization" });
            } else {
                let find = await admin_token.findOne({
                    token: decoded.token,
                    refresh_token: refresh_token,
                    revoke: false
                }).exec();
                
                if (!find) {
                    return res.status(401)
                        .json({ message: "Unauthorization" });
                }

                let jwtAdmin = jwt.verify(decoded.token, config.jwtSecretAdmin);
                let r = await bcrypt.compare(config.admin.username, jwtAdmin.id)
                if (!r) {
                    return res.status(401)
                        .json({ message: "Unauthorization" });
                }
                const exp = '2h';
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(`${config.admin.username}`, salt);

                const _token = jwt.sign(
                    { id: hash, role: "god" },
                    config.jwtSecretAdmin,
                    { expiresIn: exp, algorithm: 'HS384' }
                );

                const _refresh_token = jwt.sign(
                    { token: _token },
                    config.jwtRefreshSecretAdmin,
                    { expiresIn: exp, algorithm: 'HS384' }
                );

                admin_token.updateOne(
                    { "_id": ObjectId(find._id) },
                    {
                        $set: {
                            "token": _token,
                            "refresh_token": _refresh_token
                        }
                    }
                ).exec();

                return res
                    .status(200)
                    .json({
                        message: "Login in successfully 😊 👌",
                        statusCode: "200",
                        result: {
                            token: _token,
                            refresh_token: _refresh_token
                        }
                    });
            }
        });
    } catch (err) {
        logger.error(`admin refrehtoken error: ${err}`);
        return res
            .status(500)
            .json({
                message: "Server error",
                statusCode: "500",
            })
    }

};