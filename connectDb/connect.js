var mongoose = require('mongoose');
var config = require("../config/config")
var options = require('../model/option.model')
var request = require('request');

const connectDB = async () => {
    try {
        await mongoose.connect(`mongodb://${config.db.username}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.name}`);
        var db = mongoose.connection
        return db;
    } catch (err) {
        throw err;
    }
}

var firstTime = true;
const init = async () => {
    try {
        await connectDB();
        if(mongoose.connection.readyState == 1){
            console.log("connect db Successful" )
            return true;
        }else{
            console.log("connect db Unsuccessful" )
            return false;
        }
        // let log = mongoose.connection.readyState == 1 ? "connect db Successful" : "connect db Unsuccessful";
        // console.log(log);
        // // if (firstTime == true) {
        // //     var dayInMilliseconds = 1000 * 60 * 60 * 24;
        // //     firstTime = false;
        // //     updateUSD()
        // //     setInterval(() => {
        // //         updateUSD()
        // //     }, dayInMilliseconds);
        // // }
        // return true;
    } catch (e) {
        console.log("connect db Unsuccessful");
        console.log(`error -> ${e}`)
        return false;
    }
}

function updateUSD() {
    let converstion_url = "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD"
    request(converstion_url, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var result = JSON.parse(body);
            console.log(result.USD) // Print the google web page.
            options.findOne({ name: "ethtousd" }, function (err, option) {
                if (option) {
                    option.value = result.USD;
                    option.save(function (err, option) {
                        console.log("option updated")
                    })
                } else {
                    var optionadd = new options();
                    optionadd.name = "ethtousd";
                    optionadd.value = result.USD;
                    optionadd.save(function (err, option) {
                        console.log("option added")
                    })
                }
            })
        }
    })

}


module.exports = init
