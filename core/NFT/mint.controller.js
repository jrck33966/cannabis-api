const ethers = require("ethers");
const abi = require("../../config/abi.json");
require("dotenv").config();

exports.mint = async (req, res) => {

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

    const tokenId = 3; // change this to the token ID you want to mint (map from use database)
    const amount = 100; // amount of item to mint (map from use database)
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
    console.log(trxRecipt.hash);
    return res
        .status(200)
        .json({
            statusCode: "200",
            message: "successfully",
            hash : trxRecipt.hash
        });
}
