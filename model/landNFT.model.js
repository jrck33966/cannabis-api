const mongoose = require('mongoose');
var config = require('../config/config');

const LandNFTSchema = mongoose.Schema({
    token_id: {
        type: String,
        required: true
    },
    name: {
        type: String

    },
    image: {
        type: String
    },
    description: {
        type: String
    },
    attributes: {
        type: Object
    },
    count: {
        type: Number
    }
}, { versionKey: false });


module.exports = mongoose.model('land_nft', LandNFTSchema, config.db.prefix + 'land_nft'); 