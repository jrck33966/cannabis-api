const mongoose = require('mongoose');
var crypto = require('crypto');
var config = require('../config/config');


// const ItemSchema = mongoose.Schema({
//     name: {
//         type: String
//     },
//     imgPath: {
//         type: String
//     }
// }, { versionKey: false });

const ItemSchema = mongoose.Schema({
    id: {
        type: String
    },
    image: {
        type: String
    },
    type: {
        type: String
    },
    name: {
        type: String
    },
    rarity: {
        type: String
    },
    price: {
        type: Number
    },
    use_type: {
        type: String
    },
    quantity: {
        type: Number
    },
    phase_use: {
        type: Array
    },
    description: {
        type: String
    },
    attribute: {
        type: Object
    }
}, { versionKey: false });

module.exports = mongoose.model('items', ItemSchema, config.db.prefix + 'items'); 