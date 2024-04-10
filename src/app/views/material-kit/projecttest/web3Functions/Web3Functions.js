import Web3 from "web3";
import { INFURA_URL, CONTRACT_ABI, CONTRACT_ADDRESS, COMMON } from "ServerConfig";

const web3 = new Web3(new Web3.providers.HttpProvider(
    INFURA_URL
));

export const getNonce = async (address) => {
    return await web3.eth.getTransactionCount(address, "pending");
}

export const getEstimatedGas = async (method, paramas, address) => {
    const common = COMMON
    const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
        from: address,
    });
    await contract.methods.setDID("", "").estimateGas({ from: address })
        .then(function (gasAmount) {
            console.log(gasAmount)
        })
        .catch(function (error) {
            console.log(error)
        });
}