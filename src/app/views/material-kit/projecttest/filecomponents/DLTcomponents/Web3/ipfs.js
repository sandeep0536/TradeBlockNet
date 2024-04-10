import { create, urlSource } from 'ipfs-http-client'
const IPFS = require('ipfs-api');
const auth =
    'Basic ' + Buffer.from('2DZFMwLwPtPZG8z20COdXERb592' + ':' + '0ad1d2165e5f356c673d01078f2aaf79').toString('base64');

export const new_ipfs = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
})
export const ipfs = new IPFS({
    host: 'ipfs.infura.io', port: 5001, protocol: 'https', headers: {
        authorization: auth,
    }
});