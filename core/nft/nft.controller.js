const ethers = require("ethers");
const abi = require("../../config/abi.json");
require("dotenv").config();
const request = require('request');
var logger = require('../../config/configLog')
const config = require('../../config/config')
const landNFT = require('../../model/landNFT.model')
const player_land = require('../../model/playerLand.model')
const users = require('../../model/users.model')
const land_stat = require('../../model/land_stat.model')

var crypto = require("crypto");
const { result } = require("underscore");
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
        const { eth_address, token_id } = req.body
        const provider = new ethers.providers.JsonRpcProvider(process.env.rpcUrl);
        const ownerWallet = new ethers.Wallet(process.env.privateKey, provider);
        console.log(ownerWallet.address)
        // Prepare signer as the Contract Owner or a Deployer
        // Loading Contract by ABI JSON File
        const canItemContract = new ethers.Contract(
            process.env.contractAddress,
            abi,
            provider
        );

        const result = await canItemContract.balanceOf(eth_address, token_id);
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

        const countNftUser = user_find.player_land.filter(item => { return item.token_id == token_id })

        const provider = new ethers.providers.JsonRpcProvider(process.env.rpcUrl);
        const canItemContract = new ethers.Contract(
            process.env.contractAddress,
            abi,
            provider
        );
        const resultBalanceOf = await canItemContract.balanceOf(eth_address, token_id);

        if (countNftUser.length + 1 != resultBalanceOf.toString()) {
            logger.warn(`addNFTForUser user has nft unequal number : smart Contract = ${resultBalanceOf.toString()} , backend = ${countNftUser.length + 1}`);
            return res
                .status(400)
                .json({
                    message: "err : user has nft unequal number.",
                    statusCode: "400",
                });
        }

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

exports.addPlayerLandV2 = async (req, res) => {
    try {
        const { eth_address } = req.body;
        const provider = new ethers.providers.JsonRpcProvider(process.env.rpcUrl);
        const canItemContract = new ethers.Contract(
            process.env.contractAddress,
            abi,
            provider
        );

        // let arr = []
        let arrEth_Address = []
        let arr_id = []
        for (let i = 0; i < 300; i++) {
            arrEth_Address.push(eth_address);
            arr_id.push(i + 1);
        }

        const result = await canItemContract.balanceOfBatch(arrEth_Address, arr_id);
        let split = result.toString().split(",")

        let arr = []
        for (let i = 0; i < split.length; i++) {
            let ob = {
                token_id: (i + 1).toString(),
                count: split[i]
            }
            arr.push(ob);
        }

        let user_find = await users.findOne({ eth_address, eth_address }).exec();
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].count != '0') {
                let token_id = arr[i].token_id;
                let count = parseInt(arr[i].count);
                let count_user = user_find.player_land.filter(val => {
                    return val.token_id == token_id
                })
                if (count_user.length < count) {
                    let diff = count - count_user.length;
                    for (let j = 0; j < diff; j++) {
                        let data = await Request(`https://bafybeihvdqgamy7u3r2dcgz4qkbdtbocme65ascpnx3wbv637xpwsuic3u.ipfs.nftstorage.link/${token_id}.json`)

                        //<-- Add count nft ->
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
                            land_nft_object = data;
                            land_nft_object['token_id'] = token_id;
                            land_nft_object['count'] = 1;
                            await landNFT.create(land_nft_object)
                        }
                        //<-- Add count nft ->

                        //<-- Add Player Land ->
                        var player_land_json = {
                            land_id: await getNextSequence(),
                            token_id: token_id.toString(),
                            status: "idle",
                            is_rent: null,
                            start_rent_date: null,
                            end_rent_date: null,
                            rent_price_rate: null

                        }

                        await player_land.create(player_land_json)
                        //<-- Add Player Land ->

                        //<-- Update User ->
                        player_land_json['meta_data'] = data;
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
                        //<-- Update User ->
                        logger.info(`NFT addPlayerLand user eth_address : ${eth_address} -- add token_id: ${token_id} `);
                    }
                }
            }
        }
        return res
            .status(200)
            .json({
                statusCode: "200",
                message: "successfully"
            });
    } catch (err) {
        logger.error(`NFT addPlayerLand user eth_address : ${eth_address} -- error: ${err} `);
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

        for (let item of find.player_land) {
            let rarity = item.meta_data.attributes.rarity;
            let rarityUpper = new RegExp(["^", rarity, "$"].join(""), "i");
            let format = item.meta_data.attributes.format;
            let formatUpper = new RegExp(["^", format, "$"].join(""), "i");
            let find_land_stat = await land_stat.findOne({
                rarity: rarityUpper,
                format: formatUpper
            })
            if (find_land_stat) {
                item['survive_rate_bonus'] = find_land_stat.survive_rate_bonus
                item['grow_date_bonus'] = find_land_stat.grow_date_bonus
                item['quality_bonus'] = find_land_stat.quality_bonus
            }
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

exports.getNftAll = async (req, res) => {
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

exports.randomTokenId = async (req, res) => {
    try {
        let chkBalanceOf = true;
        let rarity = '';
        let randId = '';
        while (chkBalanceOf) {
            let randNumber = Math.random() * 100;
            randNumber = randNumber.toFixed(2)
            if (randNumber <= 0.03) {
                rarity = "SR";
            } else if (randNumber <= 0.5 && randNumber > 0.03) {
                rarity = "S"
            } else if (randNumber <= 10 && randNumber > 0.5) {
                rarity = "A"
            } else {
                rarity = "B"
            }
            let find = await landNFT.find({ "attributes.rarity": rarity }).exec();
            randId = find[Math.floor(Math.random() * find.length)];
            // check balanceOf
            const provider = new ethers.providers.JsonRpcProvider(process.env.rpcUrl);
            const ownerWallet = new ethers.Wallet(process.env.privateKey, provider);
            const canItemContract = new ethers.Contract(
                process.env.contractAddress,
                abi,
                provider
            );
            const result = await canItemContract.balanceOf(ownerWallet.address, randId.token_id);
            if (result.toString() > 0) {
                chkBalanceOf = false;
            }
            // check balanceOf
        }
        let encryptID = encrypt(randId.token_id);
        logger.info(`randomtokenId success get tokenId : ${randId.token_id} - ${rarity}`);
        return res
            .status(200)
            .json({
                statusCode: "200",
                message: "successfully",
                token_id: encryptID,
            });
    } catch (err) {
        logger.error(`randomTokenId error: ${err}`);
        return res
            .status(500)
            .json({
                message: "Server error.",
                statusCode: "500",
            })
    }
}



const Request = function (options) {
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (response) {
                if (response.statusCode = 200) {
                    return resolve(JSON.parse(body));
                }
            }
            if (error) {
                return reject(error);
            }
        });
    });
};


let algorithm = "aes-192-cbc";
let secret = config.secretHash;
const key = crypto.scryptSync(secret, 'salt', 24);

//Encrypting text
function encrypt(text) {
    const iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), data: encrypted.toString('hex') };
}

// Decrypting text
function decrypt(text) {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.data, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}


const getNextSequence = async () => {
    var ret = await player_land.find({}).sort({ land_id: -1 }).collation({ locale: "en_US", numericOrdering: true }).limit(1)
    if (ret.length == 0) return "1";
    return (parseInt(ret[0].land_id) + 1).toString();
}