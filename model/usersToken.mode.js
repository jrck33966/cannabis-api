const mongoose = require('mongoose');
var crypto = require('crypto');
var config = require('../config/config');


const usersTokenSchema = mongoose.Schema({
    eth_address: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expiresIn: {
        type: String,
        required: true
    },
    revoke: {
        type: Boolean
    }
}, { versionKey: false });

module.exports = mongoose.model('users_token', usersTokenSchema, config.db.prefix + 'users_token'); 