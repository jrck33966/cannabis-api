const express = require('express')
const cookieParser = require("cookie-parser");
const app = express()
var bodyParser = require('body-parser')
var cors = require('cors')

var admin = require("./core/admin/admin.route")
var login = require("./core/login/longin.route")
var users = require("./core/users/users.route")
var items = require("./core/items/items.route")
var image = require("./core/image/image.route")

var connect = require("./connectDb/connect")
var config = require("./config/config")
var logger = require('./config/configLog')

app.use(cors({origin:true,credentials: true}));
app.use(express.json());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser());
app.use('/', login)
app.use('/admin', admin)
app.use('/user', users)
app.use('/item', items)
app.use('/image', image)
app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
})
// app.use(function (req, res, next) {
//     res.status(500).send("Sorry Server!")
// })


app.listen(config.app.port, async () => {
    let con = await connect();
    if (con) {
        console.log(`Start server at port ${config.app.port}.`)
        logger.info(`Start server at port ${config.app.port}.`);
    } else {
        process.exit()
    }
})