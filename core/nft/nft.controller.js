const ethers = require("ethers");
const abi = require("../../config/abi.json");
require("dotenv").config();

var logger = require('../../config/configLog')
const landNFT = require('../../model/landNFT.model')
const player_land = require('../../model/playerLand.model')
const users = require('../../model/users.model')

exports.mint = async (req, res) => {
    try {
        const { tokenId, amount } = req.body;

        if (tokenId == undefined || tokenId == "") {
            return res
                .status(400)
                .json({
                    message: "err : ValidationError: tokenId: Path `tokenId` is required.",
                    statusCode: "400",
                });
        }

        if (amount == undefined || amount == "") {
            return res
                .status(400)
                .json({
                    message: "err : ValidationError: amount: Path `amount` is required.",
                    statusCode: "400",
                });
        }

        // Prepare network provider
        const provider = new ethers.providers.JsonRpcProvider(process.env.rpcUrl);
        // Prepare signer as the Contract Owner or a Deployer
        const ownerWallet = new ethers.Wallet(process.env.privateKey, provider);
        // Loading Contract by ABI JSON File
        const canItemContract = new ethers.Contract(
            process.env.contractAddress,
            abi,
            provider
        );

        // const tokenId = 3; // change this to the token ID you want to mint (map from use database)
        // const amount = 100; // amount of item to mint (map from use database)
        const ownerAddress = ownerWallet.address; // owner address for prepare claim
        // pick owner to interact with contract
        const canItemContractWithOwner = canItemContract.connect(ownerWallet);
        // call mint method from smart contract
        const trxRecipt = await canItemContractWithOwner.mint(
            ownerAddress,
            tokenId,
            amount,
            ethers.constants.AddressZero
        );
        // this is hash.you can copy this one to explorer to check the transaction result
        return res
            .status(200)
            .json({
                statusCode: "200",
                message: "successfully",
                hash: trxRecipt.hash
            });
    } catch (err) {
        logger.error(`addNFTForUser error: ${err}`);
        return res
            .status(500)
            .json({
                message: "Server error.",
                statusCode: "500",
            })
    }

}

exports.setUrl = async (req, res) => {
    try {
        const { BaseURI } = req.body;
        if (BaseURI == undefined || BaseURI == "") {
            return res
                .status(400)
                .json({
                    message: "err : ValidationError: BaseURI: Path `BaseURI` is required.",
                    statusCode: "400",
                });
        }
        const provider = new ethers.providers.JsonRpcProvider(process.env.rpcUrl);
        // Prepare signer as the Contract Owner or a Deployer
        const ownerWallet = new ethers.Wallet(process.env.privateKey, provider);
        // Loading Contract by ABI JSON File
        const canItemContract = new ethers.Contract(
            process.env.contractAddress,
            abi,
            provider
        );
        const canItemContractWithOwner = canItemContract.connect(ownerWallet);
        const result = await canItemContractWithOwner.setBaseURI(BaseURI);
        return res
            .status(200)
            .json({
                statusCode: "200",
                message: "successfully",
                hash: result.hash
            });
    } catch (err) {
        logger.error(`addNFTForUser error: ${err}`);
        return res
            .status(500)
            .json({
                message: "Server error.",
                statusCode: "500",
            })
    }
}

exports.bal = async (req, res) => {
    try {

        const provider = new ethers.providers.JsonRpcProvider(process.env.rpcUrl);
        // Prepare signer as the Contract Owner or a Deployer
        // Loading Contract by ABI JSON File
        const canItemContract = new ethers.Contract(
            process.env.contractAddress,
            abi,
            provider
        );
       
        const result = await canItemContract.balanceOf('0xA8600548Dc3eC0680A91A827Ff26F5Def533D549',1);
        return res
            .status(200)
            .json({
                statusCode: "200",
                message: "successfully",
                result: result.toString()
            });
    } catch (err) {
        logger.error(`addNFTForUser error: ${err}`);
        return res
            .status(500)
            .json({
                message: "Server error.",
                statusCode: "500",
            })
    }
}


exports.getLandNFT = async (req, res) => {
    try {
        let find = await landNFT.find({}, { _id: 0 }).exec();
        return res
            .status(200)
            .json({
                statusCode: "200",
                message: "successfully",
                result: find
            });
    } catch (err) {
        return res
            .status(500)
            .json({
                message: "Server error.",
                statusCode: "500",
            })
    }

}

exports.addPlayerLand = async (req, res) => {
    try {
        const { eth_address, token_id, meta_data } = req.body;

        if (eth_address == undefined || eth_address == "") {
            return res
                .status(400)
                .json({
                    message: "err : ValidationError: eth_address: Path `eth_address` is required.",
                    statusCode: "400",
                });
        }

        if (token_id == undefined || token_id == "") {
            return res
                .status(400)
                .json({
                    message: "err : ValidationError: token_id: Path `token_id` is required.",
                    statusCode: "400",
                });
        }

        if (meta_data == undefined || meta_data == "") {
            return res
                .status(400)
                .json({
                    message: "err : ValidationError: meta_data: Path `meta_data` is required.",
                    statusCode: "400",
                });
        }

        let user_find = await users.findOne({ eth_address, eth_address }).exec();
        if (!user_find) {
            logger.warn(`addNFTForUser Get user eth_address : ${eth_address} not foud `);
            return res
                .status(404)
                .json({
                    statusCode: "404",
                    message: "Get user not foud"
                });
        }
        //<-- Check & Add NFT Land ->

        let land_nft_object = meta_data;
        if (typeof (land_nft_object) === 'string' || land_nft_object instanceof String) {
            land_nft_object = JSON.parse(land_nft_object);
        } else {
            land_nft_object = land_nft_object;
        }

        let find_nft = await landNFT.findOne({ token_id: token_id }).exec();
        if (find_nft) {
            await landNFT.updateOne(
                {
                    "token_id": token_id
                },
                {
                    $set: {
                        "count": find_nft.count + 1
                    }
                }
            ).exec()
        } else {

            land_nft_object['token_id'] = token_id;
            land_nft_object['count'] = 1;
            await landNFT.create(land_nft_object)
        }

        //<-- Check & Add NFT Land ->


        //<-- Add Player Land ->
        var player_land_json = {
            land_id: await getNextSequence(),
            token_id: token_id,
            status: "idle",
            is_rent: null,
            start_rent_date: null,
            end_rent_date: null,
            rent_price_rate: null

        }

        await player_land.create(player_land_json)
        //<-- Add Player Land ->

        //<-- Update User ->
        delete land_nft_object['count'];
        player_land_json['meta_data'] = land_nft_object;

        if (user_find) {
            await users.updateOne(
                {
                    "eth_address": eth_address,
                },
                {
                    $push: {
                        player_land: player_land_json
                    }
                }
            ).exec()
        }
        //<-- Update User ->

        // let user_find = await users.findOne({ eth_address, eth_address }).exec();
        // if (!user_find) {
        //     logger.warn(`addNFTForUser Get user eth_address : ${eth_address} not foud `);
        //     return res
        //         .status(404)
        //         .json({
        //             statusCode: "404",
        //             message: "Get user not foud"
        //         });
        // }
        // let findNFT = await landNFT.findOne({ token_id: token_id }).exec();
        // if (!findNFT) {
        //     logger.warn(`addNFTForUser Get NFT token_id: ${token_id} not foud `);
        //     return res
        //         .status(404)
        //         .json({
        //             statusCode: "404",
        //             message: "NFT not foud"
        //         });
        // }

        // let filter_player_land = user_find.player_land.find(land =>
        //     land.token_id.toString() == findNFT.token_id.toString()
        // )
        // if (filter_player_land) {
        //     await users.updateOne(
        //         {
        //             "eth_address": eth_address,
        //             "player_land.token_id": findNFT.token_id
        //         },
        //         {
        //             $set: {
        //                 "player_land.$.quantity": filter_player_land.quantity + 1,
        //                 buy_Date: Date.now(),
        //                 lastUpdate: Date.now()
        //             }
        //         }
        //     ).exec()
        // } else {
        //     await users.updateOne(
        //         { "eth_address": eth_address },
        //         {
        //             $push: {
        //                 "player_land": {
        //                     "token_id": findNFT.token_id,
        //                     "quantity": 1,
        //                 },

        //             },
        //             $set: {
        //                 buy_Date: Date.now(),
        //                 lastUpdate: Date.now()
        //             }
        //         }
        //     ).exec();
        // }


        return res
            .status(200)
            .json({
                statusCode: "200",
                message: "successfully"
            });

    } catch (err) {
        logger.error(`addNFTToUser error: ${err}`);
        return res
            .status(500)
            .json({
                message: "Server error.",
                statusCode: "500",
            })
    }

}

exports.getByUser = async (req, res) => {
    try {
        const { eth_address } = req.body;

        if (eth_address == undefined || eth_address == "") {
            return res
                .status(400)
                .json({
                    message: "err : ValidationError: eth_address: Path `eth_address` is required.",
                    statusCode: "400",
                });
        }
        let find = await users.findOne({ eth_address: eth_address }, { _id: 0 }).exec();
        if (!find) {
            logger.warn(`NFT getByUser Get user eth_address : ${eth_address} not foud `);
            return res
                .status(404)
                .json({
                    statusCode: "404",
                    message: "Get user not foud"
                });
        }
        return res
            .status(200)
            .json({
                statusCode: "200",
                message: "successfully",
                result: find.player_land
            });
    } catch (err) {
        return res
            .status(500)
            .json({
                message: "Server error.",
                statusCode: "500",
            })
    }

}


const getNextSequence = async () => {
    var ret = await player_land.find({}).sort({ land_id: -1 }).collation({ locale: "en_US", numericOrdering: true }).limit(1)
    if (ret.length == 0) return "1";
    return (parseInt(ret[0].land_id) + 1).toString();
}