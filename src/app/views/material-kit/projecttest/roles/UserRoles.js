import Web3 from "web3";
import { INFURA_URL, CONTRACT_ABI, CONTRACT_ADDRESS, COMMON } from "ServerConfig";
const web3 = new Web3(new Web3.providers.HttpProvider(
    INFURA_URL
));
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

export const getUserRole = async (address) => {
    try {
        const hash = await contract.methods.getUserData(localStorage.getItem("userEmail")).call()
        return hash.roleHash;
    } catch (e) {
        console.log(e)
    }
}

export const getAllOrganizationUser = async (token) => {
    try {
        const users = await contract.methods.getOrganizationUserHash(token).call();
        return users;
    } catch (e) {
        console.log(e)
    }
}

