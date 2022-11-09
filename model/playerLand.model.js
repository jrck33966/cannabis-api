const mongoose = require('mongoose');
var config = require('../config/config');

const PlayerLandSchema = mongoose.Schema({
    token_id: {
        type: String,
        required: true
    },
    status: {
        type: String       
    },
    is_rent: {
        type: Boolean
    },
    start_rent_date: {
        type: Date
    },
    end_rent_date: {
        type: Date
    },
    rent_price_rate: {
        type: Number
    }
}, { versionKey: false });


module.exports = mongoose.model('player_land', PlayerLandSchema, config.db.prefix + 'player_land'); 