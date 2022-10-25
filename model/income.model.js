const mongoose = require('mongoose');
var crypto = require('crypto');
var config = require('../config/config');


const IncomeSchema = mongoose.Schema({
    eth_address: {
        type: String,
        required: true
    },
    itemId: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    Total_price: {
        type: Number
    },
    buy_Date: {
        type: Date
    }
}, { versionKey: false });


module.exports = mongoose.model('income', IncomeSchema, config.db.prefix + 'income'); 