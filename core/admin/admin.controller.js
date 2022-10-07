const jwt = require("jsonwebtoken");
const config = require("../../config/config");
const bcrypt = require('bcrypt');

exports.adminLogin = async (req, res) => {
    const { username , password } = req.body;
    if(username == undefined || username == ""){
        return res
        .status(400)
        .json({
            message: "err : ValidationError: username: Path `username` is required.",
            statusCode: "400",
        }); 
    }

    if(password == undefined || password == ""){
        return res
        .status(400)
        .json({
            message: "err : ValidationError: password: Path `password` is required.",
            statusCode: "400",
        }); 
    }
    if(username != "dev" || password != "dev") {
        return res
        .status(400)
        .json({
            message: "Password is mismatch",
            statusCode: "400",
        });
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(`${username}`, salt);
    const token = jwt.sign({ id:hash, role: "god" }, config.jwtSecretAdmin);
    var dayInMilliseconds = 1000 * 60 * 60 * 24;
    let exp = new Date(Number(new Date()) + dayInMilliseconds);
    return res
        .cookie("gdid", token, {
            httpOnly: true,
            secure: true,
            expires: exp,
            sameSite: 'None'
            
            
        })
        .status(200)
        .json({
            message: "Login in successfully 😊 👌",
            statusCode: "200",
        });
};

exports.adminlogout = (req, res) => {
    return res
        .clearCookie("gdid")
        .status(200)
        .json({ message: "Successfully logged out 😏 🍀" });
};