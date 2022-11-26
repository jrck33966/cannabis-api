const mongoose = require('mongoose');
var config = require('../config/config');


const plantingSchema = mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    eth_address: {
        type: String,
        required: true
    },
    seed_id: {
        type: String,
    },
    land_id: {
        type: String,
    },
    special_id: {
        type: String,
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
    start_planting_date: {
        type: Date
    },
    harvest_date: {
        type: Date
    },
    fail_date: {
        type: Date
    },
    is_active: {
        type: Boolean
    },
    base_sell_price: {
        type: Number
    },
    cost: {
        type: Number
    },
    // - planting_state type
    // - planting = กำลังโต 
    // - die = ตาย
    // - harvested = เก็บเกี่ยวแล้ว
    // - male 
    // - female
    planting_state: {
        type: String
    },
}, { versionKey: false });

module.exports = mongoose.model('planting', plantingSchema, config.db.prefix + 'planting'); 