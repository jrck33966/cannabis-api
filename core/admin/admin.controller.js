let ms = require('ms');
const jwt = require("jsonwebtoken");
const config = require("../../config/config");
const bcrypt = require('bcrypt');
let admin_token = require('../../model/adminToken.model')


exports.adminLogin = async (req, res) => {
    const { username, password } = req.body;
    if (username == undefined || username == "") {
        return res
            .status(400)
            .json({
                message: "err : ValidationError: username: Path `username` is required.",
                statusCode: "400",
            });
    }

    if (password == undefined || password == "") {
        return res
            .status(400)
            .json({
                message: "err : ValidationError: password: Path `password` is required.",
                statusCode: "400",
            });
    }
    if (username != "dev" || password != "dev") {
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
};

exports.adminlogout = (req, res) => {
    let token = req.token;
    admin_token.updateOne(
        { "token": token },
        {
            $set: {"revoke" : true}
        }
    ).exec();
    return res
        .clearCookie("gdid")
        .status(200)
        .json({ message: "Successfully logged out 😏 🍀" });
};