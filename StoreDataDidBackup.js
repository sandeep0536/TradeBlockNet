import React, { useEffect, useState } from 'react'
import CeramicClient from '@ceramicnetwork/http-client'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import { randomBytes } from '@stablelib/random'
import { DID } from 'dids'
import { IDX } from '@ceramicstudio/idx'
import { ENDPOINT } from 'ServerConfig'
import ThreeIdProvider from '3id-did-provider'
import { EthereumAuthProvider, ThreeIdConnect } from '@3id/connect'
import { INFURA_URL } from 'ServerConfig'
import { Aliases } from '@ceramicstudio/idx'
import Web3 from "web3";
import { Resolver } from 'did-resolver'
import { getResolver } from 'ethr-did-resolver'
import { getLegacy3BoxProfileAsBasicProfile } from '@ceramicstudio/idx'
import { client } from '@dabit3/decentralized-identity'
import history from "history.js"
const seed = randomBytes(32);

async function connect() {
    const addresses = await window.ethereum.request({
        method: 'eth_requestAccounts'
    })
    return addresses
}

function getPermission(request) {
    return request.payload.paths
}
export const getFileMetadata = async () => {
    try {
        const [address] = await connect();
        const ceramic = new CeramicClient(ENDPOINT)
        const provider = new EthereumAuthProvider(window.ethereum, address);
        const threeIdConnect = new ThreeIdConnect();
        await threeIdConnect.connect(provider);
        const did = new DID({
            provider: threeIdConnect.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        const idx = new IDX({ ceramic })
        await ceramic.did.authenticate();
        const data = await idx.get(
            'basicProfile',
            idx.id
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
        const [address] = await connect();
        const ceramic = new CeramicClient(ENDPOINT)
        const provider = new EthereumAuthProvider(window.ethereum, address);
        const threeIdConnect = new ThreeIdConnect();
        await threeIdConnect.connect(provider);
        const did = new DID({
            provider: threeIdConnect.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        const idx = new IDX({ ceramic })
        await ceramic.did.authenticate();
        const data = await idx.get(
            'basicProfile',
            idx.id
        )
        if (Object.keys(data).length > 0) {
            localStorage.setItem("did_data", JSON.stringify(data))
            return JSON.stringify(data);
        }
        else return "empty";
    } catch (e) {
        console.log(e)
        localStorage.setItem("did_data", "empty")
    }
}

export const StoreFiles = async (hash, project) => {
    try {
        const [address] = await connect();
        const ceramic = new CeramicClient(ENDPOINT)
        const provider = new EthereumAuthProvider(window.ethereum, address);
        const threeIdConnect = new ThreeIdConnect();
        await threeIdConnect.connect(provider);
        const did = new DID({
            provider: threeIdConnect.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic });

        const data = JSON.parse(await getAllDIDData());

        if (data.files == undefined || data.files == null) {
            data["files"] = {
                [project]: {
                    [hash]: hash
                }
            }
            await idx.set('basicProfile', data)
            localStorage.setItem("did_data", JSON.stringify(data))
        }
        else if (data.files[project] == undefined || data.files[project] == null) {
            data.files[project] = {
                [hash]: hash
            };
            console.log(data.files[project][hash])
            await idx.set('basicProfile', data)
            localStorage.setItem("did_data", JSON.stringify(data))
        }
        else {
            data.files[project][hash] = hash;
            console.log(data.files[project][hash])
            await idx.set('basicProfile', data)
            localStorage.setItem("did_data", JSON.stringify(data))
        }
    } catch (e) {
        console.log(e)
    }
}
export const StoreProjects = async (project) => {
    try {
        const [address] = await connect();
        const ceramic = new CeramicClient(ENDPOINT)
        const provider = new EthereumAuthProvider(window.ethereum, address);
        const threeIdConnect = new ThreeIdConnect();
        await threeIdConnect.connect(provider);
        const did = new DID({
            provider: threeIdConnect.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic });

        const allproject = JSON.parse(await getAllDIDData());
        if (allproject["project"] == null) {
            allproject["project"] = {
                [project]: project
            };
            await idx.set('basicProfile', allproject)
            localStorage.setItem("did_data", JSON.stringify(allproject))
        }
        else if (Object.keys(allproject.project).length > 0 && project != "") {
            allproject.project[project] = project;
            console.log(allproject)
            await idx.set('basicProfile', allproject)
            localStorage.setItem("did_data", JSON.stringify(allproject))
        }
    } catch (e) {
        console.log(e)
    }

}

export const StoreBusinessProjects = async (project) => {
    try {
        const [address] = await connect();
        const ceramic = new CeramicClient(ENDPOINT)
        const provider = new EthereumAuthProvider(window.ethereum, address);
        const threeIdConnect = new ThreeIdConnect();
        await threeIdConnect.connect(provider);
        const did = new DID({
            provider: threeIdConnect.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic });

        const allproject = JSON.parse(await getAllDIDData());
        console.log(allproject)
        if (allproject.business == null) {
            allproject["business"] = {
                [project]: project
            };
            await idx.set('basicProfile', allproject)
            localStorage.setItem("did_data", JSON.stringify(allproject))
        }
        else {
            allproject.business[project] = project;
            await idx.set('basicProfile', allproject)
            localStorage.setItem("did_data", JSON.stringify(allproject))
        }
    } catch (e) {
        console.log(e)
    }

}
export const getStoredWallet = async () => {
    try {
        const [address] = await connect();
        const ceramic = new CeramicClient(ENDPOINT)
        const provider = new EthereumAuthProvider(window.ethereum, address);
        const threeIdConnect = new ThreeIdConnect();
        await threeIdConnect.connect(provider);
        const did = new DID({
            provider: threeIdConnect.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        const idx = new IDX({ ceramic })
        await ceramic.did.authenticate();
        const data = await idx.get(
            'basicProfile',
            idx.id
        )
        if (Object.keys(data).length > 0)
            return JSON.stringify(data.wallet);
        else return "empty"
    } catch (e) {
        console.log(e)
        return "empty"
    }
}
export const getContacts = async () => {
    try {
        const [address] = await connect();
        const ceramic = new CeramicClient(ENDPOINT)
        const provider = new EthereumAuthProvider(window.ethereum, address);
        const threeIdConnect = new ThreeIdConnect();
        await threeIdConnect.connect(provider);
        const did = new DID({
            provider: threeIdConnect.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        const idx = new IDX({ ceramic })
        await ceramic.did.authenticate();
        const data = await idx.get(
            'basicProfile',
            idx.id
        )
        if (Object.keys(data).length > 0)
            return JSON.stringify(data.contact);
        else return JSON.stringify({})
    } catch (e) {
        console.log(e)
        return JSON.stringify({})
    }
}
export const storeShareFile = async (from, username, to) => {
}
export const storeContacts = async (email, name, pk, walletaddress) => {
    try {
        // const {
        //     ceramic, did, idx, error
        // } = await client()
        const [address] = await connect();
        const ceramic = new CeramicClient(ENDPOINT)
        const provider = new EthereumAuthProvider(window.ethereum, address);
        const threeIdConnect = new ThreeIdConnect();
        await threeIdConnect.connect(provider);
        const did = new DID({
            provider: threeIdConnect.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic });

        const data = JSON.parse(await getAllDIDData());
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
            localStorage.setItem("did_data", JSON.stringify(data))
        }
        else {
            data.contact[email] = {
                "name": name,
                "address": walletaddress,
                "email": email,
                "publickey": pk
            }
            await idx.set('basicProfile', data)
            localStorage.setItem("did_data", JSON.stringify(data))
        }
    } catch (e) {
        console.log(e)
    }

}
export const StoreWallet = async (email, name, publickey, walletaddress, privatekey) => {
    try {
        // const {
        //     ceramic, did, idx, error
        // } = await client()
        const [address] = await connect();
        const ceramic = new CeramicClient(ENDPOINT)
        const threeIdConnect = new ThreeIdConnect();
        const provider = new EthereumAuthProvider(window.ethereum, address);
        await threeIdConnect.connect(provider);
        const did = new DID({
            provider: threeIdConnect.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic });

        const data = await getAllDIDData();
        if (data == "empty" || data == undefined) {
            await idx.set('basicProfile', {
                "wallet": {
                    useremail: email,
                    username: name,
                    publicKey: publickey,
                    walletaddress: walletaddress,
                    privatekey: privatekey
                }
            })
            localStorage.setItem("did_data", JSON.stringify({
                "wallet": {
                    useremail: email,
                    username: name,
                    publicKey: publickey,
                    walletaddress: walletaddress,
                    privatekey: privatekey
                }
            }
            ))
            window.location.reload();
        }
        else {
            const allproject = JSON.parse(await getAllDIDData());
            allproject["wallet"] = {
                useremail: email,
                username: name,
                publicKey: publickey,
                walletaddress: walletaddress,
                privatekey: privatekey
            };
            await idx.set('basicProfile', allproject)
            localStorage.setItem("did_data", JSON.stringify(allproject))
            window.location.reload();
        }

    } catch (e) {
        console.log(e)
    }
}



