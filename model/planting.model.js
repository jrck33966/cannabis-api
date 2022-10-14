const mongoose = require('mongoose');
var config = require('../config/config');


const plantingSchema = mongoose.Schema({
    eth_address: {
        type: String,
        required: true
    },
    item: {
        type: Array
    },
    phase: {
        type: Number
    },
    start_phase_datetime: {
        type: Date
    },
    next_phase_datetime: {
        type: Date
    },
    grow_date_phase1: {
        type: Number
    },
    grow_date_phase2: {
        type: Number
    },
    grow_date_phase3: {
        type: Number
    },
    survival_chance_phase1: {
        type: Number
    },
    survival_chance_phase2: {
        type: Number
    },
    survival_chance_phase3: {
        type: Number
    },
    female_chance: {
        type: Number
    },
    production_quality: {
        type: Number
    },
    is_planting: {
        type: Boolean
    }
}, { versionKey: false });

module.exports = mongoose.model('planting', plantingSchema, config.db.prefix + 'planting'); 