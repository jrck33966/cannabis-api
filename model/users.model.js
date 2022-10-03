const mongoose = require('mongoose'); 
var crypto = require('crypto'); 
var config = require('../config/config');


const UserSchema = mongoose.Schema({ 
    eth_address : { 
        type : String, 
        required : true
    }, 
    item:{
        type: Array
    },
    // hash : String, 
    // salt : String 
}, { versionKey: false }); 

UserSchema.methods.setPassword = function(password) {  
    this.salt = crypto.randomBytes(16).toString('hex'); 
    this.hash = crypto.pbkdf2Sync(password, this.salt,  
    1000, 64, `sha512`).toString(`hex`); 
}; 
  
UserSchema.methods.validPassword = function(password) { 
    var hash = crypto.pbkdf2Sync(password,  
    this.salt, 1000, 64, `sha512`).toString(`hex`); 
    return this.hash === hash; 
}; 

module.exports = mongoose.model('users', UserSchema,config.db.prefix+'users'); 