const mongoose = require('mongoose');
var config = require('../config/config');


const UserSchema = mongoose.Schema({
    rarity: {
        type: String
    },
    format: {
        type: String
    },
    survive_rate_bonus: {
        type: Number
    },
    grow_date_bonus: {
        type: Number
    },
    quality_bonus: {
        type: Number
    }
}, { versionKey: false });


module.exports = mongoose.model('land_stat', UserSchema, config.db.prefix + 'land_stat'); 