const mongoose = require('mongoose');
var crypto = require('crypto');
var config = require('../config/config');
var autoIncrement = require('mongoose-auto-increment');

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
    },
    start_date:{
        type: String
    },
    end_date:{
        type: String
    }
}, { versionKey: false });
// autoIncrement.initialize(mongoose.connection);
// ItemSchema.plugin(autoIncrement.plugin, {
//     model: "items", 
//     field: "id"
//   });
module.exports = mongoose.model('items', ItemSchema, config.db.prefix + 'items'); 