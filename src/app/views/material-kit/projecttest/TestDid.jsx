import { Button } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import CeramicClient from '@ceramicnetwork/http-client'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import { randomBytes } from '@stablelib/random'
import { EthereumAuthProvider, ThreeIdConnect } from '@3id/connect'
import { DID } from 'dids'
import { IDX } from '@ceramicstudio/idx'
import { ENDPOINT } from 'ServerConfig'
import { getLegacy3BoxProfileAsBasicProfile } from '@self.id/3box-legacy'
import { client } from '@dabit3/decentralized-identity'
import ThreeIdProvider from '3id-did-provider'

const seed = randomBytes(32);


export default function TestDid() {
    const [name, setName] = useState('')
    const [image, setImage] = useState('')
    const [loaded, setLoaded] = useState(false)
    async function connect() {
        const addresses = await window.ethereum.request({
            method: 'eth_requestAccounts'
        })
        return addresses
    }
    function getPermission(request) {
        return request.payload.paths
    }
    async function readProfile() {
        const [address] = await connect()
        // const ceramic = new CeramicClient(ENDPOINT)
        // const idx = new IDX({ ceramic })

        // try {
        //     const data = await idx.get(
        //         'basicProfile',
        //         `${address}@eip155:1`
        //     )
        //     console.log('data: ', data)
        //     if (data.name) setName(data.name)
        //     if (data.avatar) setImage(data.avatar)
        // } catch (error) {
        //     console.log('error: ', error)
        //     setLoaded(true)
        // }
        const ceramic = new CeramicClient(ENDPOINT)
        const threeId = await ThreeIdProvider.create({ getPermission, seed, ceramic })
        const provider = threeId.getDidProvider()
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
        try {
            const data = await idx.get(
                'basicProfile',
                localStorage.getItem("idx_id")
            )
            console.log('data: ', data)
            return JSON.stringify(data);
        } catch (error) {
            console.log('error: ', error)
            setLoaded(true)
        }
    }
    async function updateProfile() {
        // const {
        //     ceramic, did, idx, error
        // } = await client()
        // const [address] = await connect();
        // const ceramic = new CeramicClient(ENDPOINT)
        // const threeIdConnect = new ThreeIdConnect();
        // const provider = new EthereumAuthProvider(window.ethereum, address);
        // await threeIdConnect.connect(provider);
        // const did = new DID({
        //     provider: threeIdConnect.getDidProvider(),
        //     resolver: {
        //         ...ThreeIdResolver.getResolver(ceramic)
        //     }
        // })
        // ceramic.setDID(did);
        // await ceramic.did.authenticate();
        // const idx = new IDX({ ceramic });
        // await idx.set('basicProfile', {
        //     name,
        //     avatar: image
        // })
        // const profile = {
        //     name: "Nader Dabit",
        //     bio: "DevRel at Edge & Node",
        //     twitter: "dabit3"
        // }

        // await idx.set('basicProfile', profile)
        // const data = await idx.get('basicProfile', did.id)
        // console.log(data)
        // alert("Data added on DID !")
        // const idx = new IDX({ ceramic })

        // await idx.set('basicProfile', {
        //     "name": "ayush"
        // })
        const ceramic = new CeramicClient(ENDPOINT)
        const threeId = await ThreeIdProvider.create({ getPermission, seed, ceramic })
        const provider = threeId.getDidProvider()
        const did = new DID({
            provider: threeId.getDidProvider(),
            resolver: {
                ...ThreeIdResolver.getResolver(ceramic)
            }
        })
        ceramic.setDID(did);
        await ceramic.did.authenticate();
        const idx = new IDX({ ceramic });
        const data = JSON.parse(await readProfile());
        console.log("datacurr", data)
        if (localStorage.getItem("idx_id") == null || localStorage.getItem("idx_id") == undefined) {
            await idx.set('basicProfile', {
                [name]: {
                    [name]: name
                }
            })
        } else {
            data[name] = {
                [name]: name,
            }
            await idx.set('basicProfile', data)
        }
        localStorage.setItem("idx_id", idx.id)
        alert("Data added on DID !")

    }
    return (
        <div>
            <div className="App">
                <input placeholder="Name" onChange={e => setName(e.target.value)} />
                <input placeholder="Profile Image" onChange={e => setImage(e.target.value)} />
                <button onClick={updateProfile}>Set Profile</button>
                <button onClick={readProfile}>Read Profile</button>

                {name && <h3>{name}</h3>}
                {image && <img style={{ width: '400px' }} src={image} />}
                {(!image && !name && loaded) && <h4>No profile, please create one...</h4>}
            </div>
        </div>
    );
}