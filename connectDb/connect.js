var mongoose = require('mongoose');
var config = require("../config/config")

const connectDB = async () => {
    try {
        await mongoose.connect(`mongodb://${config.db.username}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.name}`);
        var db = mongoose.connection
        return db;
    } catch (err) {
        throw err;
    }
}

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
    } catch (e) {
        console.log("connect db Unsuccessful");
        console.log(`error -> ${e}`)
        return false;
    }
}

module.exports = init
