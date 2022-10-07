const jwt = require("jsonwebtoken");
const config = require("../../config/config");
var users = require('../../model/users.model');


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
        return res
            .status(200)
            .json({
                message: "Login in Unsuccessfully",
                statusCode: "400",
            });
    }
    const token = jwt.sign({ id: find._id, role: "nor" }, config.jwtSecret , { expiresIn: '2h' });
    // var dayInMilliseconds = 1000 * 60 * 60 * 24;
    // let exp = new Date(Number(new Date()) + dayInMilliseconds);
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
    return res
        .clearCookie("uuid")
        .status(200)
        .json({ message: "Successfully logged out 😏 🍀" });
};


