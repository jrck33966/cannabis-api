const express = require('express')
const cookieParser = require("cookie-parser");
const app = express()
var bodyParser = require('body-parser')
var cors = require('cors')
require("dotenv").config();

var admin = require("./core/admin/admin.route")
var login = require("./core/login/longin.route")
var users = require("./core/users/users.route")
var items = require("./core/items/items.route")
var image = require("./core/image/image.route")
var planting = require("./core/planting/planting.route")
var reporting = require("./core/reporting/reporting.route")
var nft = require("./core/nft/nft.route")

var connect = require("./connectDb/connect")
var config = require("./config/config")
var logger = require('./config/configLog')


app.use(cors({origin:true,credentials: true}));
app.use(express.json());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser());
app.use('/api/v1', login)
app.use('/api/v2/admin', admin)
app.use('/api/v1/user', users)
app.use('/api/v1/item', items)
app.use('/api/v1/planting', planting)
app.use('/api/v1/image', image)
app.use('/api/v2/reporting', reporting)
app.use('/api/v3/nft', nft)
app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
})
app.use(function (req, res, next) {
    res.status(500).send("Internal Server error")
})

app.listen(config.app.port, async () => {
    let con = await connect();
    if (con) {
        console.log(`Start server at port ${config.app.port}.`)
        logger.info(`Start server at port ${config.app.port}.`);
    } else {
        process.exit()
    }
})