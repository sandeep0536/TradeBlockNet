import React from 'react'
import CeramicClient from '@ceramicnetwork/http-client'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import { randomBytes } from '@stablelib/random'
import { DID } from 'dids'
import { IDX } from '@ceramicstudio/idx'
import { API_URL, COMMON, ENDPOINT } from 'ServerConfig'
import ThreeIdProvider from '3id-did-provider'
import { ipfs } from "./filecomponents/DLTcomponents/Web3/ipfs";
import Web3 from "web3";
import { INFURA_URL, CONTRACT_ABI, CONTRACT_ADDRESS } from "ServerConfig";
import { PINATA_API_KEY, PINATA_SECRET_KEY } from "ServerConfig";
import pinataSDK from '@pinata/sdk';
import Common from 'ethereumjs-common';
import crypt from "crypto-js";
import { getNonce } from './web3Functions/Web3Functions'
import history from "history.js";
const pinata = pinataSDK(PINATA_API_KEY, PINATA_SECRET_KEY);

const Tx = require("ethereumjs-tx").Transaction;
const web3 = new Web3(new Web3.providers.HttpProvider(
    INFURA_URL
));
const seed = randomBytes(32);
let globalNonce = 0;
function getPermission(request) {
    return request.payload.paths
}
export const getFileMetadata = async () => {
    try {
        const ceramic = new CeramicClient(ENDPOINT)
        const threeId = await ThreeIdProvider.create({ getPermission, seed, ceramic })
        const did = new DID({
            provider: threeId.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic })
        console.log(idx)
        const data = await idx.get(
            'basicProfile',
            localStorage.getItem("idx_id")
        )
        if (Object.keys(data).length > 0)
            return JSON.stringify(data.files);
        else return "empty"
    } catch (e) {
        return "empty";
    }
}
export const getAllDIDData = async () => {
    try {
        if (localStorage.getItem("idx_id") == null) {
            return "empty";
        } else {
            const ceramic = new CeramicClient(ENDPOINT)
            const threeId = await ThreeIdProvider.create({ getPermission, seed, ceramic })
            const did = new DID({
                provider: threeId.getDidProvider(),
                resolver: {
                    ...ThreeIdResolver.getResolver(ceramic)
                }
            })
            ceramic.setDID(did);
            await ceramic.did.authenticate();
            const idx = new IDX({ ceramic })
            const data = await idx.get(
                'basicProfile',
                localStorage.getItem("idx_id")
            )
            if (Object.keys(data).length > 0) {
                localStorage.setItem("did_data", JSON.stringify(data))
                return JSON.stringify(data);
            }
            else return "empty";
        }

    } catch (e) {
        console.log(e);
        // return "empty";
    }
}
export const getContacts = async () => {
    try {
        const ceramic = new CeramicClient(ENDPOINT)
        const threeId = await ThreeIdProvider.create({ getPermission, seed, ceramic })
        const did = new DID({
            provider: threeId.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic })
        console.log(idx)
        const data = await idx.get(
            'basicProfile',
            localStorage.getItem("idx_id")
        )
        if (Object.keys(data).length > 0)
            return JSON.stringify(data.contact);
        else return JSON.stringify({})
    } catch (e) {
        console.log(e)
        return JSON.stringify({})
    }
}
export const getStoredWallet = async () => {
    try {
        const ceramic = new CeramicClient(ENDPOINT)
        const threeId = await ThreeIdProvider.create({ getPermission, seed, ceramic })
        const did = new DID({
            provider: threeId.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic })
        console.log(idx)
        const data = await idx.get(
            'basicProfile',
            localStorage.getItem("idx_id")
        )
        if (Object.keys(data).length > 0)
            return JSON.stringify(data.wallet);
        else return "empty"
    } catch (e) {
        console.log(e)
        return "empty"
    }
}
export const getDID = async () => {
    const email = localStorage.getItem("userEmail");
    const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
        gasLimit: "0x200b20",
    });
    const hash = await contract.methods.getUserData(email).call()
    return hash.hash != "" ? hash : false;
}

export const getTransferredFiles = async (address) => {
    let data;
    const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
        gasLimit: "0x200b20"
    });
    // web3.eth.subscribe("logs", function (err, res) {
    //     console.log(err)
    //     console.log(res)
    // })
    return await contract.getPastEvents("TransferOwnership", {
        fromBlock: 17382059,
        toBlock: 'latest'
    }, (error, event) => {
        if (error)
            console.log({ error })
    })
    // const data = await contract.getPastEvents("TransferOwnership")
    // console.log(data)
    // const data = await contract.methods.getAllTransferredFiles(address).call()
    // console.log("data", data)
    // return data;
}
export const storeDID = async (did, privatekey, address) => {
    globalNonce = await getNonce(address);
    const common = COMMON
    const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS, {
        from: address,
        gasLimit: "0x200b20",
    });
    const encDID = crypt.AES.encrypt("" + did, "" + privatekey).toString();
    const privateKey = Buffer.from("" + privatekey.slice(2), 'hex');
    const contractFunction = contract.methods.setDID(encDID, "" + localStorage.getItem("userEmail"))
    const functionAbi = await contractFunction.encodeABI();
    const txParams = {
        nonce: globalNonce,
        gasPrice: "0x4a817c800",
        gasLimit: "0x67c280",//0x200b20, //50000,
        to: CONTRACT_ADDRESS,
        data: functionAbi,
        value: "0x00",
        from: address
    };
    const tx = new Tx(txParams, { common });
    console.log(tx)
    tx.sign(privateKey); // Transaction Signing here
    const serializedTx = tx.serialize();
    const hash = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    console.log(hash)
}
export const StoreFiles = async (hash, project, address) => {
    for (let i = 0; i < hash.length; i++) {
        try {
            globalNonce = await getNonce(address);
            const ceramic = new CeramicClient(ENDPOINT)
            const threeId = await ThreeIdProvider.create({ getPermission, seed, ceramic })
            const did = new DID({
                provider: threeId.getDidProvider(),
                resolver: {
                    ...ThreeIdResolver.getResolver(ceramic)
                }
            })
            ceramic.setDID(did);
            await ceramic.did.authenticate();
            const idx = new IDX({ ceramic });
            // const data = JSON.parse(await getAllDIDData());
            const data = JSON.parse(localStorage.getItem("did_data"))
            if (data.files == undefined || data.files == null) {
                data["files"] = {
                    [project]: {
                        [hash[i]]: hash[i]
                    }
                }
                await idx.set('basicProfile', data)
                localStorage.setItem("idx_id", idx.id)
                localStorage.setItem("did_data", JSON.stringify(data))
                localStorage.setItem("sync", true);
            }
            else if (data.files[project] == undefined || data.files[project] == null) {
                data.files[project] = {
                    [hash[i]]: hash[i]
                };
                console.log(data.files[project][hash[i]])
                await idx.set('basicProfile', data)
                localStorage.setItem("idx_id", idx.id)
                localStorage.setItem("did_data", JSON.stringify(data))
                localStorage.setItem("sync", true);
            }
            else {
                data.files[project][hash[i]] = hash[i];
                console.log(data.files[project][hash[i]])
                await idx.set('basicProfile', data)
                localStorage.setItem("idx_id", idx.id)
                localStorage.setItem("did_data", JSON.stringify(data))
                localStorage.setItem("sync", true);
            }
            // return new Promise((resolve) => {
            //     resolve(idx.id)
            // });
        } catch (e) {
            console.log(e)
        }
    }
}
export const StoreProjects = async (project, address) => {
    try {
        globalNonce = await getNonce(address)
        const ceramic = new CeramicClient(ENDPOINT)
        const threeId = await ThreeIdProvider.create({ getPermission, seed, ceramic })
        const did = new DID({
            provider: threeId.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic });
        // const data = await getAllDIDData();
        const data = JSON.parse(localStorage.getItem("did_data"))
        console.log(data)
        let allproject = [];
        if (data !== "empty")
            allproject = data;
        if (allproject["project"] == null) {
            allproject["project"] = {
                [project]: project
            };
            await idx.set('basicProfile', allproject)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(allproject))
            localStorage.setItem("sync", true);
        }
        else if (Object.keys(allproject.project).length > 0 && project != "") {
            allproject.project[project] = project;
            await idx.set('basicProfile', allproject)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(allproject))
            localStorage.setItem("sync", true);
        }

        // const response = await storeDID(idx.id, privatekey, address)
        //     .then((res) => {
        //         console.log("response : ", res)
        //     })
    } catch (e) {
        console.log(e)
    }

}
export const StoreBusinessProjects = async (project, address) => {
    try {
        globalNonce = await getNonce(address);
        const ceramic = new CeramicClient(ENDPOINT)
        const threeId = await ThreeIdProvider.create({ getPermission, seed, ceramic })
        const did = new DID({
            provider: threeId.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic });
        // const data = await getAllDIDData();
        const data = JSON.parse(localStorage.getItem("did_data"))
        let allproject = [];
        if (data !== "empty")
            allproject = data;
        if (allproject.business == null) {
            allproject["business"] = {
                [project]: project
            };
            await idx.set('basicProfile', allproject)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(allproject))
            localStorage.setItem("sync", true);
        }
        else {
            allproject.business[project] = project;
            await idx.set('basicProfile', allproject)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(allproject))
            localStorage.setItem("sync", true);
        }

        // const response = await storeDID(idx.id, privatekey, address)
        //     .then((res) => {
        //         console.log("response : ", res)
        //     })
    } catch (e) {
        console.log(e)
    }
}
export const StoreInvoicingProjects = async (project, address) => {
    try {
        globalNonce = await getNonce(address);
        const ceramic = new CeramicClient(ENDPOINT)
        const threeId = await ThreeIdProvider.create({ getPermission, seed, ceramic })
        const did = new DID({
            provider: threeId.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic });
        // const data = await getAllDIDData();
        const data = JSON.parse(localStorage.getItem("did_data"))
        let allproject = [];
        if (data !== "empty")
            allproject = data;
        if (allproject.invoicing == null) {
            allproject["invoicing"] = {
                [project]: project
            };
            await idx.set('basicProfile', allproject)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(allproject))
            localStorage.setItem("sync", true);
        }
        else {
            allproject.invoicing[project] = project;
            await idx.set('basicProfile', allproject)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(allproject))
            localStorage.setItem("sync", true);
        }

        // const response = await storeDID(idx.id, privatekey, address)
        //     .then((res) => {
        //         console.log("response : ", res)
        //     })
    } catch (e) {
        console.log(e)
    }
}

export const StoreWOTProjects = async (project, address) => {
    try {
        globalNonce = await getNonce(address);
        const ceramic = new CeramicClient(ENDPOINT)
        const threeId = await ThreeIdProvider.create({ getPermission, seed, ceramic })
        const did = new DID({
            provider: threeId.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic });
        // const data = await getAllDIDData();
        const data = JSON.parse(localStorage.getItem("did_data"))
        let allproject = [];
        if (data !== "empty")
            allproject = data;
        if (allproject.wot == null) {
            allproject["wot"] = {
                [project]: project
            };
            await idx.set('basicProfile', allproject)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(allproject))
            localStorage.setItem("sync", true);
        }
        else {
            allproject.wot[project] = project;
            await idx.set('basicProfile', allproject)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(allproject))
            localStorage.setItem("sync", true);
        }

        // const response = await storeDID(idx.id, privatekey, address)
        //     .then((res) => {
        //         console.log("response : ", res)
        //     })
    } catch (e) {
        console.log(e)
    }
}

export const StoreEBOLProject = async (project, address) => {
    try {
        globalNonce = await getNonce(address);
        const ceramic = new CeramicClient(ENDPOINT)
        const threeId = await ThreeIdProvider.create({ getPermission, seed, ceramic })
        const did = new DID({
            provider: threeId.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic });
        // const data = await getAllDIDData();
        const data = JSON.parse(localStorage.getItem("did_data"))
        let allproject = [];
        if (data !== "empty")
            allproject = data;
        if (allproject.ebol == null) {
            allproject["ebol"] = {
                [project]: project
            };
            await idx.set('basicProfile', allproject)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(allproject))
            localStorage.setItem("sync", true);
        }
        else {
            allproject.ebol[project] = project;
            await idx.set('basicProfile', allproject)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(allproject))
            localStorage.setItem("sync", true);
        }

        // const response = await storeDID(idx.id, privatekey, address)
        //     .then((res) => {
        //         console.log("response : ", res)
        //     })
    } catch (e) {
        console.log(e)
    }
}

export const StoreELCProject = async (project, address) => {
    try {
        globalNonce = await getNonce(address);
        const ceramic = new CeramicClient(ENDPOINT)
        const threeId = await ThreeIdProvider.create({ getPermission, seed, ceramic })
        const did = new DID({
            provider: threeId.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic });
        // const data = await getAllDIDData();
        const data = JSON.parse(localStorage.getItem("did_data"))
        let allproject = [];
        if (data !== "empty")
            allproject = data;
        if (allproject.elc == null) {
            allproject["elc"] = {
                [project]: project
            };
            await idx.set('basicProfile', allproject)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(allproject))
            localStorage.setItem("sync", true);
        }
        else {
            allproject.elc[project] = project;
            await idx.set('basicProfile', allproject)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(allproject))
            localStorage.setItem("sync", true);
        }

        // const response = await storeDID(idx.id, privatekey, address)
        //     .then((res) => {
        //         console.log("response : ", res)
        //     })
    } catch (e) {
        console.log(e)
    }
}

export const storeContacts = async (email, name, pk, walletaddress, address) => {
    try {
        globalNonce = await getNonce(address)
        // console.log("global",globalNonce)
        const ceramic = new CeramicClient(ENDPOINT)
        // console.log("global1",ceramic)
        const threeId = await ThreeIdProvider.create({ getPermission, seed, ceramic })
        // console.log("global2",threeId)
        const did = new DID({
            provider: threeId.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        // console.log("global3",did)
        var cera = ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic });
        // const data = JSON.parse(await getAllDIDData());
        const data = JSON.parse(localStorage.getItem("did_data"))
        // console.log("datt",data.wallet)
        if (data.contact == null) {
            data["contact"] = {
                [email]: {
                    "name": name,
                    "address": walletaddress,
                    "email": email,
                    "publickey": pk
                }
            };
            await idx.set('basicProfile', data)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(data))
            localStorage.setItem("sync", true);
        }
        else {
            data.contact[email] = {
                "name": name,
                "address": walletaddress,
                "email": email,
                "publickey": pk
            }
            await idx.set('basicProfile', data)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(data))
        }
        localStorage.setItem("sync", true);

        // const response = await storeDID(idx.id, privatekey, address)
        //     .then((res) => {
        //         console.log("response : ", res)
        //     })
    } catch (e) {
        console.log(e)
    }
}

export const deleteContacts = async (email, address) => {
    try {
        globalNonce = await getNonce(address)
        const ceramic = new CeramicClient(ENDPOINT)
        const threeId = await ThreeIdProvider.create({ getPermission, seed, ceramic })
        const did = new DID({
            provider: threeId.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic });
        // const data = JSON.parse(await getAllDIDData());
        const data = JSON.parse(localStorage.getItem("did_data"))
        const cont = data.contact[email]
        // console.log("data", cont)
        var dd = delete data.contact[email]
        if (dd) {
            await idx.set('basicProfile', data)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(data))
            localStorage.setItem("sync", true);
        }
        // const response = await storeDID(idx.id, privatekey, address)
        //     .then((res) => {
        //         console.log("response : ", res)
        //     })
    } catch (e) {
        console.log(e)
    }
}

export const StoreWallet = async (email, name, publickey, walletaddress, privatekey, decPrivateKey, userToken, callbackWallet) => {
    try {
        const ceramic = new CeramicClient(ENDPOINT)
        const threeId = await ThreeIdProvider.create({ getPermission, seed, ceramic })
        const did = new DID({
            provider: threeId.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic });
        await idx.set('basicProfile', {
            "wallet": {
                useremail: email,
                username: name,
                publicKey: publickey,
                walletaddress: walletaddress,
                privatekey: privatekey
            },
            "userToken": userToken
        })
        localStorage.setItem("idx_id", idx.id)
        localStorage.setItem("did_data", JSON.stringify({
            "wallet": {
                useremail: email,
                username: name,
                publicKey: publickey,
                walletaddress: walletaddress,
                privatekey: privatekey
            },
            "userToken": userToken
        }
        ))
        const encDID = crypt.AES.encrypt(idx.id, decPrivateKey);
        const jsonObj = {
            "DID": "" + encDID,
            "phash": "" + privatekey
        }
        const jsonData = JSON.stringify(jsonObj)
        const bufferData = Buffer.from("" + jsonData);
        var hash;
        await ipfs.add(bufferData, async (err, ipfshash) => {
            if (err) {
                console.log(err)
                return;
            }
            else {
                localStorage.setItem("userData", ipfshash[0].hash)
                localStorage.setItem("walletAddress", walletaddress)
                hash = ipfshash[0].hash;
                await pinata.pinByHash(ipfshash[0].hash)
                callbackWallet(hash, idx.id, walletaddress, decPrivateKey)
            }
        })
        localStorage.setItem("sync", true);
    } catch (e) {
        console.log(e)
        callbackWallet(false, null, null, null)
    }
}

export const storePaymentTransferRecord = async (from, to, blockHash, ethvalue, address) => {
    try {
        globalNonce = await getNonce(address);
        const ceramic = new CeramicClient(ENDPOINT)
        const threeId = await ThreeIdProvider.create({ getPermission, seed, ceramic })
        const did = new DID({
            provider: threeId.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic });
        // const data = JSON.parse(await getAllDIDData());
        const data = JSON.parse(localStorage.getItem("did_data"))
        if (data.paymentsrecord == null) {
            data["paymentsrecord"] = {
                [blockHash]: {
                    "from": from,
                    "to": to,
                    "blockHash": blockHash,
                    "value": ethvalue
                }
            };
            await idx.set('basicProfile', data)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(data))
            localStorage.setItem("sync", true);
        }
        else {
            data.paymentsrecord[blockHash] = {
                "from": from,
                "to": to,
                "blockHash": blockHash,
                "value": ethvalue
            }
            await idx.set('basicProfile', data)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(data))
            localStorage.setItem("sync", true);
        }

        // const response = await storeDID(idx.id, privatekey, address)
        //     .then((res) => {
        //         console.log("response : ", res)
        //     })
    } catch (e) {
        console.log(e)
    }

}

export const storeMailRecord = async (from, to, subject, date, address) => {
    try {
        globalNonce = await getNonce(address);
        const ceramic = new CeramicClient(ENDPOINT)
        const threeId = await ThreeIdProvider.create({ getPermission, seed, ceramic })
        const did = new DID({
            provider: threeId.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic });
        // const data = JSON.parse(await getAllDIDData());
        const data = JSON.parse(localStorage.getItem("did_data"))
        if (data.mailrecord == null) {
            data["mailrecord"] = {
                [date]: {
                    "from": from,
                    "to": to,
                    "subject": subject,
                    "date": date
                }
            };
            await idx.set('basicProfile', data)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(data))
            localStorage.setItem("sync", true);
        }
        else {
            data.mailrecord[date] = {
                "from": from,
                "to": to,
                "subject": subject,
                "date": date
            }
            await idx.set('basicProfile', data)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(data))
            localStorage.setItem("sync", true);
        }

        // const response = await storeDID(idx.id, privatekey, address)
        //     .then((res) => {
        //         console.log("response : ", res)
        //     })
    } catch (e) {
        localStorage.removeItem("walletprogress")
        console.log(e)
    }
}

export const storeProfile = async ({
    fname,
    lname,
    localaddress,
    role,
    email,
    walletaddress,
    chain,
    subscription,
    subexp
}) => {
    try {
        const ceramic = new CeramicClient(ENDPOINT)
        const threeId = await ThreeIdProvider.create({ getPermission, seed, ceramic })
        const did = new DID({
            provider: threeId.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic });
        // const data = JSON.parse(await getAllDIDData());
        const data = JSON.parse(localStorage.getItem("did_data"))
        if (data.profile == null) {
            data["profile"] = {
                "fname": fname,
                "lname": lname,
                "localaddress": localaddress,
                "role": role,
                "email": email,
                "walletaddress": walletaddress,
                "chain": chain,
                "subscription": subscription,
                "subexp": subexp
            };
            await idx.set('basicProfile', data)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(data))
            localStorage.setItem("sync", true);
        }
        else {
            data.profile = {
                "fname": fname,
                "lname": lname,
                "localaddress": localaddress,
                "role": role,
                "email": email,
                "walletaddress": walletaddress,
                "chain": chain,
                "subscription": subscription,
                "subexp": subexp
            }
            console.log(data.profile)
            await idx.set('basicProfile', data)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(data))
            localStorage.setItem("sync", true);
        }

        // const opts = {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         "email": localStorage.getItem("userEmail"),
        //         "did": idx.id
        //     }),
        // }

        // await fetch(`${API_URL}/storedid`, opts)
    } catch (e) {
        localStorage.removeItem("walletprogress")
        console.log(e)
    }
}

export const removeTransferHash = async (project, hash, address) => {
    try {
        globalNonce = await getNonce(address)
        console.log("globalNonce", globalNonce)
        const ceramic = new CeramicClient(ENDPOINT)
        const threeId = await ThreeIdProvider.create({ getPermission, seed, ceramic })
        const did = new DID({
            provider: threeId.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic });
        console.log("globalNonce", idx.id)
        // const data = JSON.parse(await getAllDIDData());
        const data = JSON.parse(localStorage.getItem("did_data"))
        delete data.files[project][hash];
        await idx.set('basicProfile', data)
        localStorage.setItem("idx_id", idx.id)
        localStorage.setItem("did_data", JSON.stringify(data))
        console.log(data)
        localStorage.setItem("sync", true);

        // const response = await storeDID(idx.id, privatekey, address)
        //     .then((res) => {
        //         console.log("response : ", res)
        //     }).catch((e) => {
        //         console.log(e)
        //     })
    } catch (e) {
        console.log(e)
    }
}

export const storeCompanyDetails = async (companyData, companyToken, roles, address, profileImg) => {
    try {
        // console.log("sandeeppp",companyData,companyToken)
        globalNonce = await getNonce(address)
        const ceramic = new CeramicClient(ENDPOINT)
        const threeId = await ThreeIdProvider.create({ getPermission, seed, ceramic })
        const did = new DID({
            provider: threeId.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic });
        // const data = JSON.parse(await getAllDIDData());
        const data = JSON.parse(localStorage.getItem("did_data"))
        if (data.companyProfile == null) {
            companyData.did = idx.id;
            companyData.profileImg = profileImg;
            companyData.companyToken = companyToken;
            companyData.roles = roles;
            data["companyProfile"] = {
                [localStorage.getItem("userEmail")]: JSON.stringify(companyData)
            };
            await idx.set('basicProfile', data)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(data))
            localStorage.setItem("sync", true);
        }
        else {
            companyData.did = idx.id;
            companyData.profileImg = profileImg;
            companyData.companyToken = companyToken;
            companyData.roles = roles;
            data.companyProfile = {
                [localStorage.getItem("userEmail")]: JSON.stringify(companyData)
            };
            await idx.set('basicProfile', data)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(data))
            localStorage.setItem("sync", true);
        }

        // const response = await storeDID(idx.id, privatekey, address)
        //     .then((res) => {
        //         console.log("response : ", res)
        //     }).catch((e) => {
        //         console.log(e)
        //     })

    } catch (e) {
        console.log(e)
    }
}

export const storeRole = async (role, address) => {
    try {
        const ceramic = new CeramicClient(ENDPOINT)
        const threeId = await ThreeIdProvider.create({ getPermission, seed, ceramic })
        const did = new DID({
            provider: threeId.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic });
        // const data = JSON.parse(await getAllDIDData());
        const data = JSON.parse(localStorage.getItem("did_data"))
        const email = localStorage.getItem("userEmail");
        const companyData = JSON.parse(data.companyProfile[email]);
        console.log("cdata", companyData)
        const rolesArr = companyData.roles;
        rolesArr.push(role)
        let uniqueRoles = [...new Set(rolesArr)];
        companyData.roles = uniqueRoles;
        data.companyProfile[email] = JSON.stringify(companyData)
        await idx.set('basicProfile', data)
        localStorage.setItem("idx_id", idx.id)
        localStorage.setItem("did_data", JSON.stringify(data))
        localStorage.setItem("sync", true);

        // const response = await storeDID(idx.id, privatekey, address)
        //     .then((res) => {
        //         console.log("response : ", res)
        //     }).catch((e) => {
        //         console.log(e)
        //     })

    } catch (e) {
        console.log(e)
    }
}


let perdd;

export const deleteRole = async (role) => {
    try {
        const ceramic = new CeramicClient(ENDPOINT)
        const threeId = await ThreeIdProvider.create({ getPermission, seed, ceramic })
        const did = new DID({
            provider: threeId.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic });
        // const data = JSON.parse(await getAllDIDData());
        const data = JSON.parse(localStorage.getItem("did_data"))
        const email = localStorage.getItem("userEmail");
        const companyData = JSON.parse(data.companyProfile[email]);
        const permissionss = data.permissions
        // console.log("cdata",companyData)
        const rolesArr = companyData.roles;


        for (var i = 0; i < rolesArr.length; i++) {
            // console.log("assign","1")
            if (rolesArr[i] == role) {
                // console.log("assign","2")

                rolesArr.splice(i, 1);
                break;
            }
        }
        for (var i = 0; i < permissionss.length; i++) {
            // console.log("hello")
            const delper = permissionss[i]?.userRolePermission
            // console.log("delper", delper)
            if (role == permissionss[i]?.userRolePermission.Role) {
                perdd = delete delper.Role;
                break;
            }
            // console.log("kkkk",delper)
        }
        
       
            let uniqueRoles = [...new Set(rolesArr)];
            companyData.roles = uniqueRoles;
            data.companyProfile[email] = JSON.stringify(companyData)
            await idx.set('basicProfile', data)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(data))
            localStorage.setItem("sync", true);


     

    } catch (e) {
        console.log(e)
    }
}

export const storePermissions = async (permissions) => {
    try {
        const ceramic = new CeramicClient(ENDPOINT)
        const threeId = await ThreeIdProvider.create({ getPermission, seed, ceramic })
        const did = new DID({
            provider: threeId.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic });
        // const data = JSON.parse(await getAllDIDData());
        let data = JSON.parse(localStorage.getItem("did_data"))
        if (data.permissions == null) {
            data["permissions"] = permissions;
            await idx.set('basicProfile', data)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(data))
            localStorage.setItem("sync", true);
        }
        else {
            let isExist = -1;
            for (let i = 0; i < data.permissions.length; i++) {
                if (data.permissions[i].userEmail === permissions[0].userEmail) {
                    console.log("exist ", permissions[0].userEmail);
                    isExist = i;
                    break;
                }
            }
            if (isExist > -1) {
                data.permissions[isExist].userRolePermission = permissions[0].userRolePermission;
            } else {
                data.permissions[data.permissions.length] = permissions[0];
            }
            await idx.set('basicProfile', data)
            localStorage.setItem("idx_id", idx.id)
            localStorage.setItem("did_data", JSON.stringify(data))
            localStorage.setItem("sync", true);
        }
    } catch (e) {
        console.log(e)
    }

}

export async function checkLoginStatus(callback) {
    try {
        const params = arguments;
        console.log(arguments[0])
        var page = params[0];
        if (page === undefined) page = false;
        if (localStorage.getItem("userEmail") != null || localStorage.getItem("userEmail") != undefined) {
            const opts = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "email": localStorage.getItem("userEmail"),
                }),
            }
            const loginResponse = await fetch(`${API_URL}/loginStatus`, opts);
            const now = Date.now();
            await loginResponse.json().then((res) => {
                const status = res.status;
                var res = res.result[0];
                if (status) {
                    if (res.accessToken == localStorage.getItem("accessToken") && res.expiration > now) {
                    } else {
                        callback(true, page)
                    }
                } else {
                    callback(true, page)
                }
            })
        }
    } catch (e) {

    }

}