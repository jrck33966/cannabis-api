const items = require('../model/items.model');
const scriptItem = require('./item.json')

exports.insertMongo = async (req, res) => {
    try {
        await items.insertMany(scriptItem);
        return res
            .status(200)
            .json({
                statusCode: "200",
                message: "insertMongo successfully"
            });

    } catch (err) {
        logger.error(`insertMongo error: ${err}`);
        return res
            .status(400)
            .json({
                statusCode: "400",
                message: `err : ${err}`
            });
    }
}