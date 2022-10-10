const mongoose = require('mongoose'); 
var crypto = require('crypto'); 
var config = require('../config/config');


const adminTokenSchema = mongoose.Schema({ 
    token : { 
        type : String, 
        required : true
    }, 
    expiresIn : {
        type : String,
        required : true
    },
    revoke : {
        type: Boolean
    }
}, { versionKey: false }); 

module.exports = mongoose.model('admin_token', adminTokenSchema,config.db.prefix+'admin_token'); 