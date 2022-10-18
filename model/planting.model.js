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
    start_planting_date: {
        type: Date
    },
    harvest_date:{
        type: Date
    },
    fail_date:{
        type: Date
    },
    // - is_planting type
    // - planting = กำลังโต 
    // - failed = ตาย
    // - harvested = เก็บเกี่ยวแล้ว
    is_planting: {
        type:  String
    },
    is_active: {
        type: Boolean
    }
}, { versionKey: false });

module.exports = mongoose.model('planting', plantingSchema, config.db.prefix + 'planting'); 