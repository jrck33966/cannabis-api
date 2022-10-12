const jwt = require("jsonwebtoken");
const config = require("../../config/config");
var users = require('../../model/users.model');
var users_token = require('../../model/usersToken.mode')
var ms = require('ms');
var logger = require('../../config/configLog')

exports.getList = async function (req, res) {
    return res
        .status(200)
        .json({ message: "test" });
};

exports.signin = async (req, res, next) => {
    const { eth_address } = req.body;
    let find = await users.findOne({ eth_address: eth_address }).exec();
    if (find) {
        return next();
    }
    // var usersModel = new users();
    // usersModel.eth_address = eth_address;
    // usersModel.item = [];
    // usersModel.attribute = {};
    // usersModel.createDate = Date.now()
    // usersModel.lastUpdate = Date.now()

    var userJson = {
        eth_address: eth_address,
        item: [],
        attribute: null,
        createDate: Date.now(),
        lastUpdate: Date.now()

    }


    try {
        // const result = await usersModel.save();
        logger.info(`signin success by eth_address: ${eth_address}`)
        const reu = await users.create(userJson)
        return next();
        // return res
        //     .status(200)
        //     .json({
        //         statusCode: "200",
        //         message: "Signin in successfully 😊 👌",
        //         id: result._id
        //     });
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

exports.test = async (req, res, next) => {
    const { eth_address } = req.body;

    let find = await users.findOne({ eth_address: eth_address }).exec();
    if (find) {
        return res
            .status(200)
            .json({
                statusCode: "200",
                message: "Signin in successfully 😊 👌",
            });

    }
    // var usersModel = new users();
    // usersModel.eth_address = eth_address;
    // usersModel.item = [];
    // usersModel.attribute = {};
    // usersModel.createDate = Date.now()
    // usersModel.lastUpdate = Date.now()

    var userJson = {
        eth_address: eth_address,
        item: [],
        attribute: null,
        createDate: Date.now(),
        lastUpdate: Date.now()

    }


    try {
        // const result = await usersModel.save();
        const reu = await users.create(userJson)
        // return next();
        return res
            .status(200)
            .json({
                statusCode: "200",
                message: "Signin in successfully 😊 👌",
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

exports.lonig = async (req, res) => {
    const { eth_address } = req.body;
    let find = await users.findOne({ eth_address: eth_address }).exec()
    if (find == null) {
        logger.warn(`login unsuccess by eth_address: ${eth_address} not found`);
        return res
            .status(200)
            .json({
                message: "Login in Unsuccessfully",
                statusCode: "400",
            });
    }
    const exp = '2h';
    const token = jwt.sign(
        { id: find._id, role: "nor" },
        config.jwtSecret,
        { expiresIn: exp, algorithm: 'HS384' }
    );
    let newUserToken = new users_token();
    newUserToken.eth_address = eth_address;
    newUserToken.token = token;
    newUserToken.expiresIn = Date.now() + ms(exp);
    newUserToken.revoke = false;
    newUserToken.save();
    // var dayInMilliseconds = 1000 * 60 * 60 * 24;
    // let exp = new Date(Number(new Date()) + dayInMilliseconds);
    logger.info(`login success by eth_address: ${eth_address}`);
    return res
        // .cookie("uuid", token, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === "production",
        //     expires: exp
        // })
        .status(200)
        .json({
            message: "Login in successfully 😊 👌",
            statusCode: "200",
            result: {
                token: token
            }
        });
};

exports.logout = (req, res) => {
    try {
        let token = req.token;
        users_token.updateOne(
            { "token": token },
            {
                $set: { "revoke": true }
            }
        ).exec();
        logger.info(`logout success by userId: ${req.userId}`);
        return res
            .clearCookie("uuid")
            .status(200)
            .json({ message: "Successfully logged out 😏 🍀" });
    } catch (err) {
        logger.error(`logout error: ${err}`);
        return res
            .status(500)
            .json({
                message: "Server error",
                statusCode: "500",
            })
    }

};


