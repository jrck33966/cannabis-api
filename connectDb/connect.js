var mongoose = require('mongoose');
var config = require("../config/config")
var options = require('../model/option.model')
var request = require('request');

const connectDB = async () => {
    try {
        await mongoose.connect(`mongodb://${config.db.host}:${config.db.port}/${config.db.name}`, { useNewUrlParser: true });
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
        console.log("connect db Successful");
        // if (firstTime == true) {
        //     var dayInMilliseconds = 1000 * 60 * 60 * 24;
        //     firstTime = false;
        //     updateUSD()
        //     setInterval(() => {
        //         updateUSD()
        //     }, dayInMilliseconds);
        // }
        return true;
    } catch (e) {
        console.log("connect db Unsuccessful");
        console.log(`error -> ${e}`)
        return false;
    }
    // await connectDB()
    // .then(res => {
    //     console.log("connect db Successful");
    //     if (firstTime == true) {
    //         var dayInMilliseconds = 1000 * 60 * 60 * 24;
    //         firstTime = false;
    //         updateUSD()
    //         setInterval(() => {
    //             updateUSD()
    //         }, dayInMilliseconds);
    //     }
    //     return "connect db Successful";
    // }).catch(err => {
    //     console.log("connect db Unsuccessful");
    //     return "connect db Unsuccessful";
    //     // console.log(mongoose.connection.readyState);
    // });
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
